import type { FastifyInstance } from "fastify";
import OpenAI from "openai";
import { db } from "@editron/db/client";
import { projects, uploads, transcripts } from "@editron/db";
import { eq, and } from "drizzle-orm";
import { requireSession } from "../lib/session.js";
import type { TranscriptWord } from "../ai/tools.js";

const STRATEGY_SYSTEM_PROMPT = `You are Editron's AI video editor. You are about to propose an editing strategy BEFORE making any cuts.

Given the transcript, the user's brief, and any reference notes, produce a concise strategy paragraph of 4-8 sentences that describes:
- The overall shape and structure of the edit
- Which takes or sections to use and why
- Pacing and rhythm approach
- Suggested color grade direction
- Whether subtitles should be short-form (2-word UPPERCASE) or long-form (sentence case)

Be specific — reference actual transcript content. Do not hedge or list options. Commit to one clear plan the user can approve or redirect.`;

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

export async function registerAiStrategyRoutes(app: FastifyInstance) {
  app.post<{ Params: { id: string } }>("/api/projects/:id/ai/strategy", async (request, reply) => {
    const session = await requireSession(request, reply);
    if (!session) return;

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

    let userMessage = `## Transcript\n${packedTranscript}\n\n`;
    if (project.brief) userMessage += `## Brief\n${project.brief}\n\n`;
    userMessage += "Propose an editing strategy.";

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_STRATEGY_MODEL ?? "gpt-4o",
      messages: [
        { role: "system", content: STRATEGY_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      max_tokens: 500,
    });

    const strategy = completion.choices[0]?.message?.content ?? "";

    const [updated] = await db
      .update(projects)
      .set({ proposedStrategy: strategy, updatedAt: new Date().toISOString() })
      .where(eq(projects.id, project.id))
      .returning();

    return { strategy: updated.proposedStrategy };
  });
}
