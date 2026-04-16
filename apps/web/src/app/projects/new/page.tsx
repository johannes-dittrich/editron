"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReducer, useState, useRef, useCallback, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { UploadsProvider, useUploads, type UploadFile } from "@/contexts/uploads";
import { apiUrl } from "@/lib/api-url";

const ACCEPTED_VIDEO = [".mp4", ".mov", ".mkv", ".webm", ".m4v"];
const ACCEPTED_VIDEO_TYPES = [
  "video/mp4", "video/quicktime", "video/x-matroska", "video/webm",
];

const VIDEO_HOSTS = [
  "youtube.com", "youtu.be", "vimeo.com", "tiktok.com",
  "twitter.com", "x.com", "loom.com",
];
function isVideoUrl(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    if (!["http:", "https:"].includes(u.protocol)) return false;
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (VIDEO_HOSTS.some((h) => host === h || host.endsWith("." + h))) return true;
    if (/\.(mp4|mov|mkv|webm|m4v)$/i.test(u.pathname)) return true;
    return false;
  } catch {
    return false;
  }
}

type WizardState = {
  step: 1 | 2 | 3;
  projectId: string | null;
  title: string;
  referenceUrl: string;
  brief: string;
  briefAudioBlob: Blob | null;
};

type WizardAction =
  | { type: "SET_STEP"; step: 1 | 2 | 3 }
  | { type: "SET_PROJECT_ID"; id: string }
  | { type: "SET_TITLE"; title: string }
  | { type: "SET_REFERENCE_URL"; url: string }
  | { type: "SET_BRIEF"; brief: string }
  | { type: "SET_BRIEF_AUDIO"; blob: Blob | null };

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };
    case "SET_PROJECT_ID":
      return { ...state, projectId: action.id };
    case "SET_TITLE":
      return { ...state, title: action.title };
    case "SET_REFERENCE_URL":
      return { ...state, referenceUrl: action.url };
    case "SET_BRIEF":
      return { ...state, brief: action.brief };
    case "SET_BRIEF_AUDIO":
      return { ...state, briefAudioBlob: action.blob };
    default:
      return state;
  }
}

function isVideoFile(file: File): boolean {
  if (ACCEPTED_VIDEO_TYPES.includes(file.type)) return true;
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  return ACCEPTED_VIDEO.includes(ext);
}

function DropZone({
  onFiles,
  multiple = false,
  label,
  hint,
  accept,
  testId,
}: {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  label: string;
  hint: string;
  accept?: string;
  testId?: string;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [rejectMsg, setRejectMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(fileList: FileList) {
    const valid: File[] = [];
    for (const f of Array.from(fileList)) {
      if (!isVideoFile(f)) {
        setRejectMsg(`'${f.name}' isn't a video. Try .mp4, .mov, .mkv, or .webm.`);
        continue;
      }
      valid.push(f);
    }
    if (valid.length > 0) {
      setRejectMsg(null);
      onFiles(valid);
    }
  }

  return (
    <div data-testid={testId}>
      <div
        className={`cursor-pointer rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragOver ? "border-accent bg-accent/5" : "border-line"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
        aria-label={label}
      >
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="mt-1 text-sm text-ink-dim">{hint}</p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept ?? ACCEPTED_VIDEO.join(",")}
          multiple={multiple}
          onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
          data-testid={testId ? `${testId}-input` : undefined}
        />
      </div>
      {rejectMsg && (
        <p className="mt-2 text-sm text-accent" data-testid="reject-message">
          {rejectMsg}
        </p>
      )}
    </div>
  );
}

function Step1({
  state,
  dispatch,
  onNext,
}: {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
  onNext: () => void;
}) {
  const { dispatch: uploadDispatch } = useUploads();
  const [refFile, setRefFile] = useState<string | null>(null);
  const [refMode, setRefMode] = useState<"link" | "upload">("link");
  const [refUrlError, setRefUrlError] = useState<string | null>(null);

  async function handleRefFiles(files: File[]) {
    const file = files[0];
    setRefFile(file.name);
    const id = `ref_${Date.now()}`;
    const uploadFile: UploadFile = {
      id,
      file,
      kind: "reference",
      progress: 0,
      status: "uploading",
    };
    uploadDispatch({ type: "ADD_FILE", payload: uploadFile });
    setRefMode("upload");
    realUpload(id, file, "reference", state.projectId, uploadDispatch);
  }

  async function handleNext() {
    if (!state.projectId) {
      const title = state.title || `Untitled draft · ${new Date().toISOString().slice(0, 10)}`;
      try {
        const res = await fetch(`${apiUrl()}/api/projects`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        const data = await res.json();
        dispatch({ type: "SET_PROJECT_ID", id: data.id });
      } catch {
        // Project creation failed — continue anyway, will retry later
      }
    }
    onNext();
  }

  return (
    <div data-testid="step-1">
      <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-ink-dim">
        editron — new project · step 1 of 3
      </p>
      <h2 className="font-serif text-4xl font-normal leading-tight tracking-tightish md:text-5xl">
        What are you <span className="italic">making</span>?
      </h2>

      <div className="mt-10 space-y-6">
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-ink">
            Title <span className="text-ink-dim">(optional)</span>
          </label>
          <input
            id="title"
            type="text"
            value={state.title}
            onChange={(e) => dispatch({ type: "SET_TITLE", title: e.target.value.slice(0, 80) })}
            placeholder="My launch video"
            maxLength={80}
            className="flex h-11 w-full rounded-lg border border-line bg-paper px-3 py-2 text-base text-ink placeholder:text-ink-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          />
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink">
            Add a reference video <span className="text-ink-dim">(optional)</span>
          </p>
          <p className="mb-3 text-xs leading-relaxed text-ink-dim">
            Shows Editron the style, pacing, and tone you want. Paste a link
            (YouTube, Vimeo, TikTok, Loom) or upload a file.
          </p>

          <div className="mb-3 inline-flex rounded-lg border border-line bg-paper p-1">
            <button
              type="button"
              onClick={() => setRefMode("link")}
              className={
                "rounded-md px-3 py-1.5 text-xs font-medium transition " +
                (refMode === "link"
                  ? "bg-ink text-paper"
                  : "text-ink-soft hover:text-ink")
              }
            >
              Paste link
            </button>
            <button
              type="button"
              onClick={() => setRefMode("upload")}
              className={
                "rounded-md px-3 py-1.5 text-xs font-medium transition " +
                (refMode === "upload"
                  ? "bg-ink text-paper"
                  : "text-ink-soft hover:text-ink")
              }
            >
              Upload file
            </button>
          </div>

          {refMode === "link" ? (
            <div>
              <input
                type="url"
                value={state.referenceUrl}
                onChange={(e) => {
                  dispatch({ type: "SET_REFERENCE_URL", url: e.target.value });
                  setRefUrlError(null);
                }}
                onBlur={() => {
                  const v = state.referenceUrl.trim();
                  if (v && !isVideoUrl(v)) {
                    setRefUrlError(
                      "doesn't look like a video link — try a YouTube, Vimeo, TikTok, or Loom URL",
                    );
                  }
                }}
                placeholder="https://www.youtube.com/watch?v=…"
                className="flex h-11 w-full rounded-lg border border-line bg-paper px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              />
              {refUrlError ? (
                <p className="mt-2 text-xs text-accent">{refUrlError}</p>
              ) : null}
              {state.referenceUrl && !refUrlError && isVideoUrl(state.referenceUrl) ? (
                <p className="mt-2 text-xs text-ink-dim">
                  ✓ ready. Editron will fetch this during the strategy step.
                </p>
              ) : null}
            </div>
          ) : refFile ? (
            <div className="rounded-lg border border-line bg-paper-alt px-4 py-3 text-sm text-ink">
              {refFile} — uploading…
            </div>
          ) : (
            <DropZone
              onFiles={handleRefFiles}
              label="Drop or click to upload"
              hint="Any .mp4, .mov, .mkv, .webm up to 2 GB."
              testId="ref-drop-zone"
            />
          )}
        </div>
      </div>

      <div className="mt-10 flex items-center justify-end gap-4">
        <button
          onClick={handleNext}
          className="text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline"
          data-testid="skip-button"
        >
          skip →
        </button>
        <button
          onClick={handleNext}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 text-base font-medium text-paper hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          data-testid="next-button"
        >
          Next <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

const BRIEF_PLACEHOLDERS = [
  "What's this video about? Who is it for? How should it feel? What do you want them to do after watching?",
  "60-second product demo for Twitter. Punchy, fast cuts. End on the pricing page with a clear CTA.",
  "Interview-style testimonial. Keep only the strongest soundbites. Warm color grade, no music.",
];

function Step2({
  state,
  dispatch,
  onNext,
}: {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
  onNext: () => void;
}) {
  const [placeholder] = useState(
    () => BRIEF_PLACEHOLDERS[Math.floor(Math.random() * BRIEF_PLACEHOLDERS.length)]
  );
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const charCount = state.brief.length;

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        dispatch({ type: "SET_BRIEF_AUDIO", blob });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recorder.start();
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((d) => {
          if (d >= 119) {
            recorder.stop();
            setRecording(false);
            return 120;
          }
          return d + 1;
        });
      }, 1000);
    } catch {
      setMicError(
        "Your browser blocked microphone access. Type the brief instead, or allow the mic in your browser settings."
      );
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function deleteRecording() {
    setAudioUrl(null);
    setDuration(0);
    dispatch({ type: "SET_BRIEF_AUDIO", blob: null });
  }

  function formatTime(s: number) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  return (
    <div data-testid="step-2">
      <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-ink-dim">
        editron — new project · step 2 of 3
      </p>
      <h2 className="font-serif text-4xl font-normal leading-tight tracking-tightish md:text-5xl">
        Tell Editron what it&apos;s <span className="italic">for</span>.
      </h2>

      <div className="mt-10 space-y-6">
        <div>
          <textarea
            value={state.brief}
            onChange={(e) => dispatch({ type: "SET_BRIEF", brief: e.target.value })}
            placeholder={placeholder}
            rows={4}
            className="flex min-h-[120px] w-full resize-y rounded-lg border border-line bg-paper px-3 py-2 text-base text-ink placeholder:text-ink-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            data-testid="brief-textarea"
          />
          {charCount >= 400 && (
            <p className="mt-1 text-sm text-ink-dim">
              {charCount}/500
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-line" />
          <span className="text-xs uppercase tracking-[0.22em] text-ink-dim">or</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <div data-testid="voice-memo">
          {micError && (
            <p className="mb-3 text-sm text-accent" data-testid="mic-error">
              {micError}
            </p>
          )}

          {!audioUrl ? (
            <div className="flex items-center gap-4">
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors ${
                  recording
                    ? "border-accent bg-accent/10"
                    : "border-line hover:border-ink"
                }`}
                aria-label={recording ? "Stop recording" : "Record a voice memo"}
                data-testid="record-button"
              >
                {recording ? (
                  <div className="h-4 w-4 rounded-sm bg-accent" />
                ) : (
                  <div className="h-4 w-4 rounded-full bg-accent" />
                )}
              </button>
              <div className="text-sm text-ink-dim">
                {recording ? (
                  <span data-testid="recording-timer">
                    {formatTime(duration)} / 2:00
                  </span>
                ) : (
                  "Record a voice memo"
                )}
              </div>
              {recording && (
                <div className="flex h-6 flex-1 items-center gap-0.5" data-testid="waveform">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-full bg-accent"
                      style={{
                        height: `${Math.random() * 100}%`,
                        minHeight: 4,
                        animationDuration: `${0.3 + Math.random() * 0.4}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio src={audioUrl} controls className="h-10 flex-1" data-testid="audio-playback" />
                <span className="text-sm text-ink-dim">{formatTime(duration)}</span>
              </div>
              <button
                onClick={deleteRecording}
                className="text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline"
                data-testid="delete-recording"
              >
                Delete and re-record
              </button>
              {duration >= 120 && (
                <p className="text-sm text-ink-dim">
                  Capped at 2 minutes — briefs work better short anyway.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 flex items-center justify-end gap-4">
        <button
          onClick={onNext}
          className="text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline"
          data-testid="skip-button"
        >
          skip →
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 text-base font-medium text-paper hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          data-testid="next-button"
        >
          Next <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Step3({ state }: { state: WizardState }) {
  const router = useRouter();
  const { state: uploadState, dispatch: uploadDispatch } = useUploads();

  const sourceFiles = uploadState.files.filter((f) => f.kind === "source");
  const doneCount = sourceFiles.filter((f) => f.status === "done").length;
  const canOpen = doneCount >= 1;

  function handleFiles(files: File[]) {
    for (const file of files) {
      const id = `src_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const uploadFile: UploadFile = {
        id,
        file,
        kind: "source",
        progress: 0,
        status: "queued",
      };
      uploadDispatch({ type: "ADD_FILE", payload: uploadFile });
      realUpload(id, file, "source", state.projectId, uploadDispatch);
    }
  }

  function openProject() {
    if (state.projectId) {
      router.push(`/projects/${state.projectId}`);
    }
  }

  return (
    <div data-testid="step-3">
      <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-ink-dim">
        editron — new project · step 3 of 3
      </p>
      <h2 className="font-serif text-4xl font-normal leading-tight tracking-tightish md:text-5xl">
        Drop your <span className="italic">footage</span>.
      </h2>

      <div className="mt-10">
        <DropZone
          onFiles={handleFiles}
          multiple
          label="Drop files or click"
          hint="Any number of .mp4, .mov, .mkv, .webm, up to 50 GB per file."
          testId="source-drop-zone"
        />

        {sourceFiles.length > 0 && (
          <div className="mt-6 space-y-3" data-testid="upload-list">
            {sourceFiles.map((f) => (
              <div key={f.id} className="flex items-center gap-4">
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                  {f.file.name}
                </span>
                {f.status === "done" ? (
                  <span className="text-sm text-ink-dim">done</span>
                ) : f.status === "error" ? (
                  <span className="text-sm text-accent">{f.error ?? "failed"}</span>
                ) : (
                  <div className="flex w-32 items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-alt">
                      <div
                        className="h-full rounded-full bg-ink transition-all"
                        style={{ width: `${f.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-ink-dim">{Math.round(f.progress)}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 flex items-center justify-end">
        <button
          onClick={openProject}
          disabled={!canOpen}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 text-base font-medium text-paper hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-40"
          data-testid="open-project-button"
        >
          Open project <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

const PART_SIZE = 10 * 1024 * 1024; // 10 MB per part

async function realUpload(
  id: string,
  file: File,
  kind: "source" | "reference" | "brief_audio",
  projectId: string | null,
  dispatch: React.Dispatch<
    | { type: "UPDATE_PROGRESS"; id: string; progress: number }
    | { type: "SET_STATUS"; id: string; status: UploadFile["status"]; error?: string }
  >,
) {
  dispatch({ type: "SET_STATUS", id, status: "uploading" });
  try {
    // 1. initiate multipart upload
    const initRes = await fetch(`${apiUrl()}/api/uploads/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        projectId,
        kind,
        filename: file.name,
        contentType: file.type || "video/mp4",
        sizeBytes: file.size,
      }),
    });
    if (!initRes.ok) {
      const msg = await initRes.text().catch(() => "upload init failed");
      dispatch({ type: "SET_STATUS", id, status: "error", error: msg });
      return;
    }
    const init = await initRes.json();
    const uploadId = init.uploadId ?? init.id;
    const partCount = Math.max(1, Math.ceil(file.size / PART_SIZE));

    // 2. upload each part via signed URLs
    const parts: { partNumber: number; etag: string }[] = [];
    for (let i = 0; i < partCount; i++) {
      const partNumber = i + 1;
      const start = i * PART_SIZE;
      const end = Math.min(start + PART_SIZE, file.size);
      const blob = file.slice(start, end);

      // get signed URL for this part
      const urlRes = await fetch(`${apiUrl()}/api/uploads/${uploadId}/part-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ partNumber }),
      });
      if (!urlRes.ok) {
        dispatch({ type: "SET_STATUS", id, status: "error", error: "failed to get part URL" });
        return;
      }
      const { url: signedUrl } = await urlRes.json();

      // PUT directly to R2
      const putRes = await fetch(signedUrl, {
        method: "PUT",
        body: blob,
      });
      if (!putRes.ok) {
        dispatch({ type: "SET_STATUS", id, status: "error", error: `part ${partNumber} upload failed` });
        return;
      }
      const etag = putRes.headers.get("etag") ?? `"${partNumber}"`;
      parts.push({ partNumber, etag: etag.replace(/"/g, "") });

      dispatch({
        type: "UPDATE_PROGRESS",
        id,
        progress: Math.round(((i + 1) / partCount) * 100),
      });
    }

    // 3. complete multipart upload
    const completeRes = await fetch(`${apiUrl()}/api/uploads/${uploadId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ parts }),
    });
    if (!completeRes.ok) {
      dispatch({ type: "SET_STATUS", id, status: "error", error: "complete failed" });
      return;
    }
    dispatch({ type: "UPDATE_PROGRESS", id, progress: 100 });
    dispatch({ type: "SET_STATUS", id, status: "done" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "upload failed";
    dispatch({ type: "SET_STATUS", id, status: "error", error: msg });
  }
}

function WizardInner() {
  const [state, dispatch] = useReducer(wizardReducer, {
    step: 1,
    projectId: null,
    title: "",
    referenceUrl: "",
    brief: "",
    briefAudioBlob: null,
  });

  const goToStep = useCallback(
    (step: 1 | 2 | 3) => dispatch({ type: "SET_STEP", step }),
    []
  );

  return (
    <div className="min-h-screen bg-paper">
      <nav className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-6">
          <Link
            href="/"
            className="font-serif text-2xl italic tracking-tight text-ink"
          >
            editron
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-8 py-16">
        {state.step === 1 && (
          <Step1 state={state} dispatch={dispatch} onNext={() => goToStep(2)} />
        )}
        {state.step === 2 && (
          <Step2 state={state} dispatch={dispatch} onNext={() => goToStep(3)} />
        )}
        {state.step === 3 && <Step3 state={state} />}
      </main>
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <UploadsProvider>
      <WizardInner />
    </UploadsProvider>
  );
}
