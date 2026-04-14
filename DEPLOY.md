# Deploying the Editron website

The website lives in `website/` — a plain static site (HTML + CSS + JS, no build
step). Production serves from Azin via `@azin-tech/cli`. A boxd proxy mirror
stays available as a fallback.

## Production — Azin (live)

> **https://web-production-8c8f.4631dc.up.azin.host**

- Project: `editron`  ·  Environment: `production`  ·  Service: `web` (App)
- Source: `johannes-dittrich/editron` main branch, Dockerfile build from
  `website/` context
- Endpoint: HTTP:8080 behind CDN, public access, allocated domain
- 1 replica, 0.5 vCPU / 512 MiB
- `zin deploy status -e production` to check rollout; `zin service open web`
  to open the live URL in a browser; `zin logs web -f -e production` to tail

Auto-deploy on push is off by default — every push to `main` requires
`zin deploy run -e production` to publish.

## Fallback — boxd proxy

An nginx on this VM also serves the site at:

> **https://calm-wolf.boxd.sh/**

Files are read directly from `/home/boxd/editron/website/`, so every edit to
the repo is reflected on the next request.

To reinstall or modify the nginx config:

```bash
sudo cp /etc/nginx/sites-available/editron /etc/nginx/sites-available/editron.bak
sudo $EDITOR /etc/nginx/sites-available/editron
sudo nginx -t && sudo systemctl reload nginx
```

Nginx is enabled via systemd and will start on boot. This is the temporary
target — for the real domain move to Azin.

## Re-deploying after a content change

Auto-deploy on push is **on** — pushing to `johannes-dittrich/editron:main`
triggers Azin to build and roll out a new version automatically. To publish
an update:

```bash
# commit on setup/claude-harness in this repo, then mirror to main:
git push mirror setup/claude-harness:main
```

That's it. Azin picks up the webhook, runs the Dockerfile build, and rolls
the new replica once healthy. Tail progress with
`zin deploy status -e production`. No manual `zin deploy run` needed unless
you've staged a config change (service settings, endpoint, resources).

## How the Azin service is wired (for reference)

```bash
# one-time, already applied:
zin service create app --name web \
  --repo ph79v2ktc03tv7y166c357m41984vprq \
  --branch main -e production

zin service set source web --type github \
  --repo ph79v2ktc03tv7y166c357m41984vprq \
  --branch main \
  --build-type dockerfile \
  --dockerfile Dockerfile \
  --build-context website \
  -e production

zin endpoint add web --protocol http --port 8080 -e production
zin endpoint set-public web --index 0 --enabled -e production
zin endpoint set-cdn    web --index 0 --enabled -e production

zin deploy run -e production
```

The `--dockerfile` path is **relative to the build context**, not to the repo
root. Setting `--build-context website` + `--dockerfile website/Dockerfile`
looks for `website/website/Dockerfile` and fails. Use `--dockerfile Dockerfile`.

### Known CLI quirks encountered during setup

- `zin service set bucket <name> --public-access --static-website` sends raw
  boolean values which the server rejects (`ArgumentValidationError` — the
  server expects `{type: "PublicRead"}` / `{type: "Enabled", indexPage: ...}`).
  Workaround: use an App service with the nginx Dockerfile instead of a static
  bucket.
- `zin repo list -e production` (non-JSON) returns `repos is not iterable`. The
  `--json` variant works and returns a `.page[]` array.
- API keys with `Deploy: disabled` silently succeed on staging commands but
  fail on `deploy run`. `zin whoami` is the source of truth.
- `zin connector github` generates an OAuth URL, but clicking it outside an
  Azin console session can produce `Missing organization ID`. Start the
  connector flow from the web console at https://console.azin.run/ instead.
- The GitHub App that Azin installs is `azin-run` (slug). Installs must happen
  under an account where the target repo lives; read-only permission is enough
  for deploys.

## Dockerfile

`website/Dockerfile` builds a ~15MB nginx:alpine image that serves the static
files on port 8080 with gzip, long-cache headers on static assets, and clean
URLs (`/pages/docs` → `/pages/docs.html`). It is the image that the Azin App
service will build from.

## Where things are

| Thing                       | Path                                           |
|-----------------------------|------------------------------------------------|
| Website source              | `website/`                                     |
| Landing page                | `website/index.html`                           |
| Docs                        | `website/pages/docs.html`                      |
| Pricing                     | `website/pages/pricing.html`                   |
| Waitlist form               | `website/pages/waitlist.html`                  |
| Styles                      | `website/css/style.css`                        |
| JS (waitlist + docs nav)    | `website/js/main.js`                           |
| Dockerfile                  | `website/Dockerfile`                           |
| Local nginx config (live)   | `/etc/nginx/sites-available/editron`           |
| Azin project link           | `zin.json` (`{"project": "editron"}`)          |
| Azin live URL               | https://web-production-8c8f.4631dc.up.azin.host |
| Azin source mirror          | `johannes-dittrich/editron` (main)             |
