# Work Queue

The scheduled agent picks the **first unchecked item** and dispatches it
through planner → implementer → reviewer. Add new tasks at the bottom.

## Guidelines for writing tasks

- One outcome per item. "Add X and refactor Y" should be two items.
- Name the user-visible behavior, not the implementation. Let the
  planner choose the files.
- If the task needs a decision you have to make, write it in
  QUESTIONS.md instead — the planner will stop there rather than guess.

## Done

- [x] Scaffold the landing site (`website/`) with landing, docs, pricing,
      and waitlist pages, styled in the elevenlabs.io direction.
- [x] Serve the site on the boxd proxy via nginx at
      https://calm-wolf.boxd.sh/ as a fallback target.
- [x] Ship the site to production on Azin at
      https://web-production-8c8f.4631dc.up.azin.host — App service `web`
      building from `johannes-dittrich/editron` main via the `website/`
      Dockerfile, HTTP:8080 behind CDN, 1 replica running. Full wiring
      written up in `DEPLOY.md`.
- [x] Add per-branch staging deployments via `scripts/stage.sh` — forks
      the production environment into `staging-<slug>` on first use,
      re-points the web service at the target branch, runs the deploy,
      and prints the public URL. Smoke-tested end-to-end.

## Open — product

- [ ] Write a short product one-pager at `PRODUCT.md` that pins down who
      Editron is for, what a first-paid session looks like, and the one
      jobs-to-be-done statement we optimize for.
- [ ] Decide packaging: is Editron (a) a free Claude Code skill with paid
      transcription/compute, (b) a hosted SaaS wrapping the skill, or
      (c) a desktop app shipping the skill. Record the choice and the
      reasoning in `PRODUCT.md` §Packaging.
- [ ] Land the primary use case in the hero copy. Today the homepage
      hedges across "talking heads, montages, tutorials, travel,
      interviews" — pick the single most compelling wedge and rewrite
      the hero around it.

## Open — website

- [ ] Wire the waitlist form to a real backend (currently just writes to
      `localStorage`). Options to evaluate: a tiny Azin
      ScheduledTask + Postgres, a Google Form proxy, or Formspree.
- [ ] Add a 30-second hero demo video above the terminal animation —
      sourced from a real launch-video session, not a mock.
- [ ] Add a `/changelog` page that pulls from git tags on the main repo
      so every release shows up automatically.
- [ ] Ship an OG image generator so link previews look good on social.

## Open — deploy

- [ ] Register a real custom domain (e.g. `editron.video`) and point it
      at the Azin endpoint via `zin domain`. Until then, the generated
      `*.up.azin.host` URL is the public face.
- [ ] Auto-deploy on push is **on** by default. Revisit once we have a real
      review gate — currently every push to `johannes-dittrich/editron:main`
      ships to production with no pre-check.
- [ ] Decide whether to consolidate the mirror: today this repo pushes
      `setup/claude-harness` → `johannes-dittrich/editron:main` as a
      mirror for Azin. Either drop the mirror (once we make
      `mathisdittrich/editron` directly visible to Azin) or make the
      mirror explicit by adding a thin `scripts/deploy.sh` that does the
      push + `zin deploy run` in one step.

## Open — prototype

- [ ] Walk through an end-to-end real session with real footage using
      the current `video-use-main` skill and capture: what breaks, what
      feels slow, what feels magical. Write findings to
      `video-use-main/PROTOTYPE_NOTES.md`.
- [ ] From those notes, pick the three highest-leverage fixes and open
      one task per fix here (don't batch them).
- [ ] Write one end-to-end smoke test that runs the full pipeline on a
      small fixture clip and asserts `final.mp4` exists with roughly the
      expected duration. No mocks. Cache the transcript so the test is
      cheap on reruns.
