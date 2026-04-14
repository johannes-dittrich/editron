# Work Queue

The scheduled agent picks the **first unchecked item** and dispatches it
through planner → implementer → reviewer. Add new tasks at the bottom.

## Guidelines for writing tasks

- One outcome per item. "Add X and refactor Y" should be two items.
- Name the user-visible behavior, not the implementation. Let the
  planner choose the files.
- If the task needs a decision you have to make, write it in
  QUESTIONS.md instead — the planner will stop there rather than guess.

## Tasks

- [ ] (example — delete or replace before scheduling) Add a short
      `HARNESS.md` at the repo root explaining how the planner /
      implementer / reviewer workflow uses TASKS.md.
