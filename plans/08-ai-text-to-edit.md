# 08 — AI Text-to-Edit

## Goal
Turn a user's plain-English directive into an EDL. The user types
"tighten the intro" or "use take 4 for the punchline", and Editron
produces structured cut decisions the render pipeline can execute.

## Stack
- **Model:** OpenAI `gpt-5.4` (also fine: `gpt-5.4-mini` for cheaper
  iteration loops). Key configured.
- **Prompt style:** structured function calling with a single tool
  `emit_edl` whose parameters match the EDL JSON schema.
- **Input context:** the phrase-packed transcript, the user brief from
  the project context screen, the current EDL (if any), and the latest
  directive.

## Tasks

### 1 — Tool definition
- [ ] `apps/api/src/ai/tools.ts` exports a Zod schema for `emit_edl` matching the EDL JSON spec
- [ ] Convert to OpenAI function schema via `zod-to-json-schema`

### 2 — Reason-and-emit endpoint
- [ ] `POST /api/projects/:id/ai/edit` with `{ directive: string }`
- [ ] Loads: transcript (packed), brief, reference video style notes (Phase 3), current EDL
- [ ] Builds a system prompt from `plans/08-prompts/editor.md` (new file) that embeds the SKILL.md hard rules
- [ ] Calls OpenAI with the tool, gets back a new EDL
- [ ] Persists as a new version in `edls` (previous version stays for undo)
- [ ] Returns the new EDL + a short natural-language summary

### 3 — Strategy step (first call)
- [ ] Before any cuts happen, Editron runs a "propose strategy" call:
      input = transcript + brief + reference notes, output = a
      4–8-sentence paragraph describing shape, takes, pacing, grade, subs
- [ ] User approves in the UI. Only after approval does the first
      `emit_edl` call run.

### 4 — Iteration
- [ ] Each subsequent directive gets the current EDL in context and is
      asked to produce a diff (but we actually emit a full new EDL
      because diff-merging is a loss source — cheap tokens, safer math)

### 5 — Strictness
- [ ] The tool's Zod schema rejects any `start`/`end` that doesn't snap
      to a word boundary from the transcript. The model is told to
      always quote exact transcript segments.
- [ ] Failing validation → retry once with an error feedback prompt

### 6 — Cost shaping
- [ ] For directives that don't change the cut structure (e.g., "make
      the grade warmer", "different subtitle style"), we use a smaller
      model (`gpt-5.4-mini`) and skip the full transcript context

---

## Notes

- **Anthropic option**: if we see tool-call quality issues, we can swap
  to Claude Sonnet 4.6 with strict tool calling. The tool schema is
  provider-agnostic; just need a second code path.
- **Reference video**: Phase 3 extends this to also analyze pacing /
  shot length / grade stats from the user's uploaded reference clip
  and include those as metadata in the prompt.
- **Prompt caching**: OpenAI automatic prompt caching kicks in for
  prompts ≥1024 tokens and lasts 5-10 min. The system prompt + hard
  rules are the static prefix (~2k tokens) and benefit from caching
  across the multi-turn iteration loop.
