# Deploying the Editron website

The website lives in `website/` — a plain static site (HTML + CSS + JS, no build
step). Two deploy targets are documented here: a temporary boxd proxy (currently
serving) and the Azin CLI target (preferred; needs two one-time setup steps).

## Current state — live on boxd proxy

The site is currently served by nginx on this VM and exposed via the boxd
proxy at:

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

## Target — Azin (`@azin-tech/cli`)

The Azin project is already created: `editron` (production environment).
Config lives in `zin.json` at the repo root.

### One-time setup (must be done in the Azin console)

1. **Enable deploy permission on the API key**
   - Open [console](https://cloud.azin.com) → Settings → API Keys
   - Find the current key (`zin_k_90d4e9b7…`)
   - Toggle "Deploy permission" to on
   - *Why:* `zin whoami` currently reports `Deploy: disabled`, which blocks
     `zin deploy run` regardless of other config.

2. **Connect the GitHub org that owns the editron repo**
   - Console → Settings → Connectors → GitHub
   - Install the Azin GitHub app on the `mathisdittrich` org (the
     `threetapsknowledge` connection already exists but doesn't cover this repo)
   - *Why:* The App source needs a `connectionId` that can read
     `mathisdittrich/editron`.

### Deploy once setup is complete

From this repo root:

```bash
# stage a new App service built from the Dockerfile
zin service create app \
  --name web \
  --repo mathisdittrich/editron \
  --branch setup/claude-harness \
  -e production

# point it at the Dockerfile under website/
zin service set source web \
  --type github \
  --dockerfile website/Dockerfile \
  --context website \
  -e production

# give it a public endpoint on HTTP/8080 with CDN
zin endpoint create web --port 8080 --public --cdn -e production

# apply
zin deploy run -e production
```

`zin deploy status -e production` tails the build.

### Known CLI quirks (as of version installed 2026-04-14)

- `zin service set bucket <name> --public-access --static-website` sends raw
  boolean values which the server rejects (`ArgumentValidationError` — the
  server expects `{type: "PublicRead"}` / `{type: "Enabled", indexPage: ...}`).
  Workaround: configure bucket public-access / static-website via the web
  console, or use an App service with the nginx Dockerfile (the documented path
  above).
- `zin repo list -e production` returns `repos is not iterable` when the
  GitHub integration is installed on an org with zero connected repos.
- API keys with `Deploy: disabled` silently succeed on staging commands but
  fail on `deploy run`. The `zin whoami` flag is the source of truth.

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
