import { editorTimeline, mediaLibrary, sampleMessages } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronsLeftRightEllipsis,
  Clapperboard,
  Download,
  FolderUp,
  MessageSquareMore,
  Minus,
  MousePointer2,
  Plus,
  Redo2,
  Scissors,
  Search,
  Sparkles,
  Type,
  Undo2
} from "lucide-react";

const toolbar = [
  ["Select", MousePointer2],
  ["Razor", Scissors],
  ["Text", Type]
] as const;

export function EditorShell({ projectId }: { projectId: string }) {
  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#060606] text-white">
      <header className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-3">
        <div className="flex items-center gap-5">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Editor</div>
            <div className="mt-1 text-lg font-semibold">{projectId === "new" ? "Untitled Project" : "Spring Campaign Launch"}</div>
          </div>

          <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1 md:flex">
            {toolbar.map(([label, Icon], index) => (
              <button
                key={label}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                  index === 0 ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-300 transition hover:bg-white/10">
            <Undo2 className="h-4 w-4" />
          </button>
          <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-300 transition hover:bg-white/10">
            <Redo2 className="h-4 w-4" />
          </button>
          <button className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff6d1f]">
            <span className="inline-flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </span>
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-px bg-white/10 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
        <aside className="flex min-h-0 flex-col bg-[#090909]">
          <div className="border-b border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Media Library</div>
                <div className="mt-1 text-xs text-zinc-500">Footage, stills, audio, and titles</div>
              </div>
              <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-300">
                <FolderUp className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 rounded-[24px] border border-dashed border-white/15 bg-white/5 p-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <FolderUp className="h-5 w-5" />
              </div>
              <div className="mt-4 text-sm font-medium">Drop media to upload</div>
              <p className="mt-2 text-xs leading-5 text-zinc-500">Drag files here or choose from disk. Upload route is already wired in the Fastify API.</p>
            </div>
          </div>

          <div className="border-b border-white/10 p-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-500">
              <Search className="h-4 w-4" />
              <input className="w-full bg-transparent outline-none placeholder:text-zinc-600" placeholder="Search media" />
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
            {mediaLibrary.map((item) => (
              <div key={item.id} className="rounded-3xl border border-white/10 bg-white/5 p-3">
                <div className="flex gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-transparent">
                    <Clapperboard className="h-6 w-6 text-zinc-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-white">{item.name}</div>
                    <div className="mt-2 text-xs leading-5 text-zinc-500">{item.meta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="grid min-h-0 grid-rows-[minmax(0,1fr)_280px] bg-[#050505]">
          <div className="relative min-h-0 overflow-hidden border-b border-white/10 p-4">
            <div className="surface-card relative flex h-full min-h-[320px] items-center justify-center overflow-hidden rounded-[32px] border border-white/10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,90,0,0.2),transparent_32%)]" />
              <div className="absolute inset-x-8 top-8 flex items-center justify-between rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
                <span>Preview</span>
                <span>00:18 / 02:18</span>
              </div>

              <div className="relative aspect-video w-full max-w-4xl rounded-[28px] border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-6 shadow-glow">
                <div className="hero-grid relative h-full overflow-hidden rounded-[22px] border border-white/10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,90,0,0.16),transparent_38%)]" />
                  <div className="absolute inset-y-0 w-24 animate-scan bg-gradient-to-r from-transparent via-white/10 to-transparent blur-xl" />
                  <div className="absolute inset-x-8 bottom-8 flex items-end justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Scene 02</div>
                      <div className="mt-2 text-3xl font-semibold">Launch spot rough cut</div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-zinc-300">
                      4K preview
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="min-h-0 overflow-hidden p-4">
            <div className="flex h-full flex-col rounded-[28px] border border-white/10 bg-[#0a0a0a]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold">Timeline</div>
                  <div className="mt-1 text-xs text-zinc-500">Three tracks, clip blocks, playhead, and zoom controls</div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400">
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">100%</div>
                  <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="relative min-h-0 flex-1 overflow-auto p-4">
                <div className="absolute left-[188px] top-0 z-20 h-full w-px bg-accent" />
                <div className="mb-4 grid grid-cols-[160px_repeat(12,minmax(88px,1fr))] gap-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
                  <div />
                  {Array.from({ length: 12 }).map((_, index) => (
                    <div key={index}>{`00:${String(index * 5).padStart(2, "0")}`}</div>
                  ))}
                </div>

                <div className="space-y-4">
                  {editorTimeline.tracks.map((track) => (
                    <div key={track.id} className="grid grid-cols-[160px_minmax(0,1fr)] gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-white">{track.name}</div>
                            <div className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">{track.type}</div>
                          </div>
                          <ChevronDown className="h-4 w-4 text-zinc-500" />
                        </div>
                      </div>

                      <div className="relative rounded-2xl border border-white/10 bg-[#070707] p-3">
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:88px_100%]" />
                        <div className="relative flex h-16 items-center gap-2">
                          {track.clips.map((clip) => (
                            <div
                              key={clip.id}
                              className="flex h-12 items-center rounded-2xl px-3 text-sm font-medium text-white shadow-lg"
                              style={{
                                width: `${Math.max(120, clip.duration * 10)}px`,
                                marginLeft: `${clip.startTime * 4}px`,
                                background: `linear-gradient(135deg, ${clip.color}, rgba(255,255,255,0.08))`
                              }}
                            >
                              {clip.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="flex min-h-0 flex-col bg-[#090909]">
          <div className="border-b border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">AI Director</div>
                <div className="mt-1 text-xs text-zinc-500">Chat-driven edit control</div>
              </div>
              <div className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-accentSoft">
                Online
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4">
            {sampleMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[92%] rounded-[24px] border px-4 py-3 text-sm leading-6",
                  message.role === "assistant"
                    ? "border-white/10 bg-white/5 text-zinc-200"
                    : "ml-auto border-accent/20 bg-accent/10 text-white"
                )}
              >
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                  {message.role === "assistant" ? <Sparkles className="h-3.5 w-3.5" /> : <MessageSquareMore className="h-3.5 w-3.5" />}
                  {message.role}
                  <span>{message.timestamp}</span>
                </div>
                <p className="mt-2">{message.content}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 p-4">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-3">
              <textarea
                rows={4}
                className="w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                placeholder="Ask Editron to tighten the intro, remove filler words, or add a branded subtitle pass."
              />
              <div className="mt-3 flex items-center justify-between">
                <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs uppercase tracking-[0.18em] text-zinc-400">
                  <ChevronsLeftRightEllipsis className="h-4 w-4" />
                  Transcript context
                </button>
                <button className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff6d1f]">
                  Send
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
