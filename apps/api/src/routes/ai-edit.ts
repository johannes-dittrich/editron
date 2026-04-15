import type { FastifyInstance } from "fastify";
import OpenAI from "openai";
import { db } from "@editron/db/client";
import { projects, edls, transcripts, uploads } from "@editron/db";
import { eq, and, desc } from "drizzle-orm";
import { requireSession } from "../lib/session.js";
import { edlSchema, emitEdlTool, validateWordBoundaries, type TranscriptWord } from "../ai/tools.js";

const SYSTEM_PROMPT = `You are Editron's AI video editor. You produce Edit Decision Lists (EDLs) from user directives.

HARD RULES (non-negotiable):
1. Never cut inside a word. Every cut start/end must snap to a word boundary from the transcript.
2. Pad every cut edge by 30-200ms to absorb transcript timestamp drift.
3. Audio is primary, visuals follow. Cut decisions come from speech boundaries and silence gaps.
4. Always quote the exact transcript text in each range's "quote" field.
5. Output-timeline offsets: output_time = word.start - segment_start + segment_offset.

You receive the transcript, the user's brief, the current EDL (if any), and a directive.
Call the emit_edl tool with a complete new EDL. Do not explain — just emit the EDL.`;

function buildUserMessage(
  directive: string,
  transcript: string,
  brief: string | null,
  currentEdl: unknown | null,
  sources: Record<string, string>,
): string {
  let msg = `## Available sources\n${JSON.stringify(sources, null, 2)}\n\n`;
  msg += `## Transcript\n${transcript}\n\n`;
  if (brief) msg += `## Brief\n${brief}\n\n`;
  if (currentEdl) msg += `## Current EDL\n${JSON.stringify(currentEdl, null, 2)}\n\n`;
  msg += `## Directive\n${directive}`;
  return msg;
}

function packTranscript(words: TranscriptWord[]): string {
  if (words.length === 0) return "(empty transcript)";
  const lines: string[] = [];
  let currentLine = "";
  let lastEnd = 0;

  for (const w of words) {
    if (w.start - lastEnd > 0.5 && currentLine) {
      lines.push(currentLine.trim());
      currentLine = `[${w.start.toFixed(2)}s] `;
    }
    if (!currentLine) currentLine = `[${w.start.toFixed(2)}s] `;
    currentLine += w.text + " ";
    lastEnd = w.end;
  }
  if (currentLine) lines.push(currentLine.trim());
  return lines.join("\n");
}

export async function registerAiEditRoutes(app: FastifyInstance) {
  app.post<{ Params: { id: string } }>("/api/projects/:id/ai/edit", async (request, reply) => {
    const session = await requireSession(request, reply);
    if (!session) return;

    const body = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
    const directive = body?.directive;
    if (!directive || typeof directive !== "string") {
      reply.code(400);
      return { error: "directive is required" };
    }

    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, request.params.id), eq(projects.userId, session.user.id)));

    if (!project) {
      reply.code(404);
      return { error: "Project not found" };
    }

    const projectUploads = await db
      .select()
      .from(uploads)
      .where(and(eq(uploads.projectId, project.id), eq(uploads.kind, "source")));

    let allWords: TranscriptWord[] = [];
    for (const upload of projectUploads) {
      const [t] = await db.select().from(transcripts).where(eq(transcripts.uploadId, upload.id));
      if (t?.words) {
        allWords = allWords.concat(t.words as TranscriptWord[]);
      }
    }

    const packedTranscript = packTranscript(allWords);

    const sourcesMap: Record<string, string> = {};
    for (const u of projectUploads) {
      sourcesMap[u.id] = u.r2Key;
    }

    const [currentEdl] = await db
      .select()
      .from(edls)
      .where(eq(edls.projectId, project.id))
      .orderBy(desc(edls.version))
      .limit(1);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: buildUserMessage(
          directive,
          packedTranscript,
          project.brief,
          currentEdl?.payload ?? null,
          sourcesMap,
        ),
      },
    ];

    let edlResult: unknown;
    let summary = "";

    for (let attempt = 0; attempt < 2; attempt++) {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_EDIT_MODEL ?? "gpt-4o",
        messages,
        tools: [emitEdlTool],
        tool_choice: { type: "function", function: { name: "emit_edl" } },
      });

      const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
      if (!toolCall || toolCall.function.name !== "emit_edl") {
        reply.code(500);
        return { error: "Model did not call emit_edl" };
      }

      const raw = JSON.parse(toolCall.function.arguments);
      if (!raw.sources && Object.keys(sourcesMap).length > 0) {
        raw.sources = sourcesMap;
      }
      const parsed = edlSchema.safeParse(raw);
      if (!parsed.success) {
        if (attempt === 0) {
          messages.push(completion.choices[0].message);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: `Validation error: ${parsed.error.message}. Fix and retry.`,
          });
          continue;
        }
        reply.code(422);
        return { error: "EDL validation failed", details: parsed.error.issues };
      }

      const boundaryErrors = validateWordBoundaries(parsed.data.ranges, allWords);
      if (boundaryErrors.length > 0) {
        if (attempt === 0) {
          messages.push(completion.choices[0].message);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: `Word boundary violations:\n${boundaryErrors.join("\n")}\nSnap all cut points to exact word boundaries and retry.`,
          });
          continue;
        }
      }

      edlResult = parsed.data;
      summary = completion.choices[0]?.message?.content ?? "EDL updated.";
      break;
    }

    if (!edlResult) {
      reply.code(500);
      return { error: "Failed to produce valid EDL after retries" };
    }

    const newVersion = (currentEdl?.version ?? 0) + 1;

    const [newEdl] = await db
      .insert(edls)
      .values({
        projectId: project.id,
        version: newVersion,
        payload: edlResult,
      })
      .returning();

    return { edl: newEdl, summary };
  });
}
