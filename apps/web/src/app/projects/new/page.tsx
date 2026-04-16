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

type WizardState = {
  step: 1 | 2 | 3;
  projectId: string | null;
  title: string;
  brief: string;
  briefAudioBlob: Blob | null;
};

type WizardAction =
  | { type: "SET_STEP"; step: 1 | 2 | 3 }
  | { type: "SET_PROJECT_ID"; id: string }
  | { type: "SET_TITLE"; title: string }
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
    // Simulate upload in background (MSW will handle real API)
    simulateUpload(id, uploadDispatch);
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
          {refFile ? (
            <div className="rounded-lg border border-line bg-paper-alt px-4 py-3 text-sm text-ink">
              {refFile} — uploading…
            </div>
          ) : (
            <DropZone
              onFiles={handleRefFiles}
              label="Drop or click to upload"
              hint="Shows Editron the style, pacing, and tone you want."
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
      simulateUpload(id, uploadDispatch);
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

function simulateUpload(
  id: string,
  dispatch: React.Dispatch<{ type: "UPDATE_PROGRESS"; id: string; progress: number } | { type: "SET_STATUS"; id: string; status: UploadFile["status"] }>
) {
  dispatch({ type: "SET_STATUS", id, status: "uploading" });
  let progress = 0;
  const interval = setInterval(() => {
    progress += 5 + Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      dispatch({ type: "UPDATE_PROGRESS", id, progress: 100 });
      dispatch({ type: "SET_STATUS", id, status: "done" });
    } else {
      dispatch({ type: "UPDATE_PROGRESS", id, progress });
    }
  }, 200 + Math.random() * 200);
}

function WizardInner() {
  const [state, dispatch] = useReducer(wizardReducer, {
    step: 1,
    projectId: null,
    title: "",
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
