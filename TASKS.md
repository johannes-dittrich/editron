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
      https://calm-wolf.boxd.sh/ as the temporary live target.
- [x] Prepare the Azin deploy path: project `editron` created, `zin.json`
      linked, `website/Dockerfile` ready, blockers + exact deploy commands
      written up in `DEPLOY.md`.

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

- [ ] Enable deploy permission on the Azin API key in the console
      (Settings → API Keys) and re-run `zin whoami` to confirm.
- [ ] Install the Azin GitHub app on the `mathisdittrich` org so the
      editron repo can be used as an App source.
- [ ] After the two gates above, run the exact command sequence in
      `DEPLOY.md` §"Deploy once setup is complete" and point the custom
      domain at the new App endpoint.
- [ ] Once Azin is live, retire the boxd proxy target: update links in
      `README.md` and `DEPLOY.md`, but keep the nginx config in the repo
      as a fallback.

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
