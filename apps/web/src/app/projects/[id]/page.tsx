"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Project, Upload } from "@editron/shared";
import { apiUrl } from "@/lib/api-url";

const INGEST_MESSAGES = [
  "sharpening the scissors...",
  "squinting at waveforms...",
  "asking the audio nicely...",
  "counting the ums...",
  "finding the punchlines...",
  "measuring silence in milliseconds...",
  "skipping the small talk...",
  "memorizing your brief...",
  "setting up the splice bay...",
  "asking: is this the take or is this the take?",
];

function RotatingMessage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        let next = Math.floor(Math.random() * INGEST_MESSAGES.length);
        while (next === prev) {
          next = Math.floor(Math.random() * INGEST_MESSAGES.length);
        }
        return next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-sm italic text-ink-dim" data-testid="ingest-message">
      {INGEST_MESSAGES[index]}
    </span>
  );
}

function ScanBar() {
  return (
    <div className="relative h-1 w-full overflow-hidden rounded-full bg-paper-alt">
      <div className="absolute inset-0 h-full w-1/3 animate-scan rounded-full bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type UploadWithMeta = Upload & {
  durationS?: number;
  speakers?: number;
};

function UploadRow({
  upload,
  onViewTranscript,
}: {
  upload: UploadWithMeta;
  onViewTranscript: (id: string) => void;
}) {
  const filename = upload.r2Key.split("/").pop() ?? upload.r2Key;

  return (
    <div
      className="border-t border-line py-4"
      data-testid="upload-row"
      data-status={upload.status}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span className="truncate font-mono text-sm text-ink">
              {filename}
            </span>
            <span className="shrink-0 text-[11px] uppercase tracking-[0.15em] text-ink-dim">
              {upload.status}
            </span>
            {upload.status === "processed" && upload.durationS && (
              <span className="font-mono text-xs text-ink-dim">
                {formatDuration(upload.durationS)}
              </span>
            )}
          </div>

          {upload.status === "uploaded" && (
            <div className="mt-2">
              <ScanBar />
              <div className="mt-1.5">
                <RotatingMessage />
              </div>
            </div>
          )}

          {upload.status === "failed" && (
            <p className="mt-1 text-sm text-accent">
              transcription failed — we&apos;ll keep trying.
            </p>
          )}
        </div>

        {upload.status === "processed" && (
          <button
            onClick={() => onViewTranscript(upload.id)}
            className="shrink-0 text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline"
            data-testid="view-transcript"
          >
            View transcript
          </button>
        )}
      </div>
    </div>
  );
}

function TranscriptPanel({
  uploadId,
  onClose,
}: {
  uploadId: string;
  onClose: () => void;
}) {
  const [transcript, setTranscript] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${apiUrl()}/api/uploads/${uploadId}/transcript`)
      .then((r) => r.json())
      .then((data) => {
        setTranscript(
          typeof data.text === "string"
            ? data.text
            : JSON.stringify(data.words ?? data, null, 2)
        );
        setLoading(false);
      })
      .catch(() => {
        setTranscript("couldn't load transcript.");
        setLoading(false);
      });
  }, [uploadId]);

  return (
    <div
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-line bg-paper shadow-lg"
      data-testid="transcript-panel"
    >
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <h3 className="font-serif text-xl">Transcript</h3>
        <button
          onClick={onClose}
          className="text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline"
          data-testid="close-transcript"
        >
          Close
        </button>
      </div>
      <div className="overflow-y-auto p-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-paper-alt" />
            ))}
          </div>
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-ink-soft">
            {transcript}
          </pre>
        )}
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [uploads, setUploads] = useState<UploadWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transcriptUploadId, setTranscriptUploadId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      const [projRes, uploadsRes] = await Promise.all([
        fetch(`${apiUrl()}/api/projects/${projectId}`),
        fetch(`${apiUrl()}/api/projects/${projectId}/uploads`),
      ]);
      if (!projRes.ok) throw new Error("not found");
      const projData = await projRes.json();
      setProject(projData);

      if (uploadsRes.ok) {
        const uploadsData = await uploadsRes.json();
        setUploads(uploadsData);
      }
      setLoading(false);
    } catch {
      setError("couldn't load this project.");
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();

    // Polling fallback every 2s for progress updates
    pollRef.current = setInterval(fetchProject, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchProject]);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <nav className="border-b border-line">
          <div className="mx-auto flex max-w-6xl items-center px-8 py-6">
            <Link href="/" className="font-serif text-2xl italic tracking-tight text-ink">
              editron
            </Link>
          </div>
        </nav>
        <main className="mx-auto max-w-6xl px-8 py-16">
          <div className="space-y-4">
            <div className="h-8 w-64 animate-pulse rounded bg-paper-alt" />
            <div className="h-4 w-40 animate-pulse rounded bg-paper-alt" />
            <div className="mt-8 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded border-t border-line bg-paper-alt" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-paper">
        <nav className="border-b border-line">
          <div className="mx-auto flex max-w-6xl items-center px-8 py-6">
            <Link href="/" className="font-serif text-2xl italic tracking-tight text-ink">
              editron
            </Link>
          </div>
        </nav>
        <main className="mx-auto max-w-6xl px-8 py-16">
          <p className="text-lg text-ink-soft" data-testid="error-state">
            {error ?? "project not found."}
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sm text-ink underline-offset-4 hover:underline"
          >
            ← back to dashboard
          </Link>
        </main>
      </div>
    );
  }

  const statusLabel: Record<string, string> = {
    draft: "Draft",
    ingesting: "Ingesting",
    ready: "Ready",
    archived: "Archived",
  };

  return (
    <div className="min-h-screen bg-paper">
      <nav className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-6">
          <Link href="/" className="font-serif text-2xl italic tracking-tight text-ink">
            editron
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline"
          >
            ← Dashboard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-8 py-16">
        <div className="mb-10">
          <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-ink-dim">
            Project
          </p>
          <div className="flex items-start justify-between gap-4">
            <h1
              className="font-serif text-4xl font-normal leading-tight tracking-tightish"
              data-testid="project-title"
            >
              {project.title}
            </h1>
            <span className="shrink-0 rounded-full border border-line px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-ink-dim">
              {statusLabel[project.status] ?? project.status}
            </span>
          </div>
          {project.brief && (
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
              {project.brief}
            </p>
          )}
        </div>

        {uploads.length === 0 ? (
          <div className="py-12 text-center" data-testid="no-uploads">
            <p className="text-lg text-ink-soft">
              No files uploaded yet.
            </p>
            <Link
              href={`/projects/new`}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-accent-dark"
            >
              Upload footage <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div data-testid="uploads-list">
            <p className="mb-4 text-[11px] uppercase tracking-[0.22em] text-ink-dim">
              Uploads
            </p>
            {uploads.map((upload) => (
              <UploadRow
                key={upload.id}
                upload={upload}
                onViewTranscript={setTranscriptUploadId}
              />
            ))}
          </div>
        )}
      </main>

      {transcriptUploadId && (
        <TranscriptPanel
          uploadId={transcriptUploadId}
          onClose={() => setTranscriptUploadId(null)}
        />
      )}
    </div>
  );
}
