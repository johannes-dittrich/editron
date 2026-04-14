# 08 — AI Text-to-Edit (Natural Language Commands)

## Goal
Let users describe edits in plain English and have AI translate them into timeline operations. The flagship differentiator.

---

## Tasks

### 8.1 Command Parser
- [ ] LLM-powered intent recognition (GPT-4 / Claude)
- [ ] Map natural language → edit operation schema
- [ ] Examples:
  - "Cut out the first 10 seconds" → trim operation
  - "Add a fade transition between clips 2 and 3" → transition
  - "Speed up the boring part in the middle" → speed + auto-detect
  - "Add background music that matches the mood" → audio suggestion
  - "Make it look cinematic" → color grading preset
  - "Remove all the ums and awkward pauses" → smart trim
  - "Add subtitles in Spanish" → transcription + translation

### 8.2 Context-Aware Editing
- [ ] Feed current timeline state to LLM as context
- [ ] Understand references: "the part where she laughs", "the intro"
- [ ] Multi-step commands: "Split this into 3 equal parts and add transitions"
- [ ] Clarification flow: "Which clip do you mean?" when ambiguous

### 8.3 Chat Interface
- [ ] Sidebar chat panel in editor
- [ ] Command history
- [ ] Suggested commands / quick actions
- [ ] Preview changes before applying
- [ ] "Undo last AI edit" button

### 8.4 Prompt Engineering
- [ ] System prompt with edit operation schema
- [ ] Few-shot examples for common edits
- [ ] Function calling to map to concrete API operations
- [ ] Streaming responses for real-time feedback
- [ ] Cost optimization (use smaller models for simple commands)

### 8.5 Smart Suggestions
- [ ] Proactive suggestions: "Your video has long pauses, want me to clean them up?"
- [ ] Post-upload suggestions: "I found 5 scenes. Want an auto-edit?"
- [ ] Style suggestions based on content type (vlog, tutorial, promo)

---

## Keys Needed
- OpenAI API key (GPT-4 for intent parsing)
- (Optional) Anthropic API key as fallback

## Depends On
- 04-video-engine (operations)
- 05-timeline-editor (UI integration)
- 06-ai-scene-detection (content understanding)

## Estimated Effort
~7-10 days
