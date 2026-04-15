import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";

// V3 — "Demo First"
// Inter tight, Hero halved: copy + product-demo, "how it works" with
// screenshot-heavy steps. Most traditional product-marketing feel but still
// impeccable.style (light, no gradients, high contrast, no nested cards).

export default function LandingPage() {
  return (
    <main className="bg-paper text-ink">
      {/* nav */}
      <nav className="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-ink">
              <span className="text-sm font-bold text-paper">e</span>
            </div>
            <span className="text-base font-semibold tracking-tight">Editron</span>
          </div>
          <div className="hidden items-center gap-9 text-sm text-ink-dim md:flex">
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#features" className="hover:text-ink">Features</a>
            <a href="#pricing" className="hover:text-ink">Pricing</a>
            <Link href="/login" className="hover:text-ink">Sign in</Link>
          </div>
          <Link
            href="/signup"
            className="hidden items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink-2 md:inline-flex"
          >
            Try for free
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      {/* hero — split layout */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:py-32">
          {/* copy side */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-paper-alt px-3 py-1 text-xs text-ink-dim">
              <Sparkles className="h-3 w-3 text-accent" />
              Conversation-driven video editing
            </div>
            <h1 className="text-balance text-[clamp(2.5rem,5.5vw,5rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
              Drop the footage. Describe the cut. Ship the video.
            </h1>
            <p className="mt-7 max-w-lg text-pretty text-lg leading-relaxed text-ink-dim">
              Editron transcribes, picks the takes, trims the fillers, grades,
              subtitles, and exports — while you talk to it in plain English.
              Audio is primary. Visuals follow.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3.5 text-sm font-medium text-paper transition hover:bg-ink-2"
              >
                Try for free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-lg border border-line-2 px-6 py-3.5 text-sm font-medium hover:bg-paper-alt"
              >
                See how it works
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-ink-soft">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent" />
                10 min render free
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent" />
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent" />
                $12/mo after
              </span>
            </div>
          </div>

          {/* demo side */}
          <div className="relative">
            <div className="device-shadow overflow-hidden rounded-xl border border-line-2 bg-paper-alt">
              {/* chrome */}
              <div className="flex items-center gap-2 border-b border-line bg-paper px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </div>
                <span className="ml-2 text-[11px] text-ink-soft">editron / launch-video.proj</span>
              </div>
              {/* preview pane */}
              <div className="border-b border-line bg-ink p-5">
                <div className="aspect-video overflow-hidden rounded-md bg-paper-warm">
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto mb-2 h-12 w-12 rounded-full border-2 border-ink flex items-center justify-center">
                        <div className="h-0 w-0 border-y-[8px] border-y-transparent border-l-[14px] border-l-ink ml-1" />
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-ink-dim">720p preview</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* transcript strip */}
              <div className="space-y-2 px-5 py-4 font-mono text-[11px] leading-relaxed">
                <div className="text-ink-soft">
                  <span className="text-ink-dim">[00:02]</span> Ninety percent of what a web agent does is{" "}
                  <span className="bg-accent/20 px-1 text-ink">completely wasted</span>.
                </div>
                <div className="text-ink-soft">
                  <span className="text-ink-dim">[00:08]</span> We fixed this.
                </div>
                <div className="text-ink-soft">
                  <span className="text-ink-dim">[00:11]</span>{" "}
                  <span className="line-through opacity-50">Uh, so basically,</span> Editron reasons on the audio first.
                </div>
              </div>
              {/* chat strip */}
              <div className="border-t border-line bg-paper p-4">
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5 text-xs">
                    <span className="mt-0.5 rounded-sm bg-ink px-1.5 py-0.5 text-[10px] font-semibold text-paper">you</span>
                    <span className="text-ink">tighten the hook, warmer grade</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs">
                    <span className="mt-0.5 rounded-sm bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-paper">editron</span>
                    <span className="text-ink-dim">tightened. grade shifted +warmth. ready to preview.</span>
                  </div>
                </div>
              </div>
            </div>
            {/* decorative tag */}
            <div className="absolute -right-3 -top-3 rounded-md border border-line-2 bg-paper px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-accent shadow-sm">
              live
            </div>
          </div>
        </div>
      </section>

      {/* how it works — 3 steps with big numbers */}
      <section id="how" className="border-b border-line bg-paper-warm">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-16 max-w-2xl">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-accent">How it works</p>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-semibold tracking-[-0.025em] leading-tight">
              From raw clips to final export in three steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            {[
              {
                n: "01",
                title: "Set the context",
                body:
                  "Drop a reference video in the style you want. Add a voice memo or text brief — what's the video about, who it's for, how it should be structured. Upload the raw footage. Editron reads everything before proposing a single cut."
              },
              {
                n: "02",
                title: "Approve the strategy",
                body:
                  "Editron proposes the shape in plain English — hook, setup, payoff, CTA — picks the best takes, and tells you in four sentences what it plans to build. You approve, iterate, or redirect."
              },
              {
                n: "03",
                title: "Ship the cut",
                body:
                  "720p preview in seconds. Word-level iteration — 'tighten the hook', 'warmer grade', 'lose the last shot'. Final render with color grade, subtitles, and loudness normalization when you say ship."
              }
            ].map((s) => (
              <div key={s.n}>
                <div className="mb-4 font-mono text-xs text-accent">{s.n}</div>
                <h3 className="mb-3 text-xl font-semibold tracking-tight">{s.title}</h3>
                <p className="text-pretty text-sm leading-relaxed text-ink-dim">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* features — 6 items */}
      <section id="features" className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-16 max-w-2xl">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-accent">Features</p>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-semibold tracking-[-0.025em] leading-tight">
              Every hard rule of production, encoded.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {[
              ["Word-level transcripts", "ElevenLabs Scribe with speaker diarization and audio events. Every cut snaps to a word boundary."],
              ["Audio-first reasoning", "Cut candidates come from word boundaries and silence gaps — not from guessing at visuals."],
              ["Per-segment grading", "Lossless concat, 30 ms audio fades, PTS-shifted overlays, subtitles applied last."],
              ["Parallel animations", "PIL, Manim, or Remotion — spawned as parallel sub-agents. Total wall time is the slowest one, not the sum."],
              ["Social-ready loudness", "Two-pass EBU R128: −14 LUFS, −1 dBTP, LRA 11. Ships at the level every platform wants."],
              ["Session memory", "Every session appends to project.md. Next week's cut picks up where you left off."]
            ].map(([t, c]) => (
              <div key={t}>
                <div className="mb-3 flex h-1 w-10 bg-accent" />
                <h3 className="mb-2 text-base font-semibold tracking-tight">{t}</h3>
                <p className="text-sm leading-relaxed text-ink-dim">{c}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* pricing */}
      <section id="pricing" className="border-b border-line bg-paper-alt">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-accent">Pricing</p>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-semibold tracking-[-0.025em] leading-tight">
              Free to try. Pay when it ships.
            </h2>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 lg:grid-cols-3">
            {[
              {
                name: "Free",
                price: "$0",
                per: "/month",
                desc: "For trying Editron on personal projects.",
                items: ["10 minutes of render / mo", "720p previews", "One project"],
                cta: "Start",
                href: "/signup",
                featured: false
              },
              {
                name: "Creator",
                price: "$24",
                per: "/month",
                desc: "For founders, marketers, solo creators.",
                items: ["10 hours of render / mo", "1080p & 4K finals", "Unlimited projects", "Priority Scribe queue"],
                cta: "Start",
                href: "/signup?plan=creator",
                featured: true
              },
              {
                name: "Studio",
                price: "$96",
                per: "/month",
                desc: "For agencies and teams shipping weekly.",
                items: ["40 hours of render / mo", "Brand kits & grading presets", "Team seats", "SLA + onboarding"],
                cta: "Contact",
                href: "mailto:hello@editron.video",
                featured: false
              }
            ].map((p) => (
              <div
                key={p.name}
                className={[
                  "flex flex-col rounded-xl border bg-paper p-7",
                  p.featured ? "border-ink" : "border-line"
                ].join(" ")}
              >
                <div className="mb-6">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-base font-semibold">{p.name}</h3>
                    {p.featured ? (
                      <span className="rounded-full bg-ink px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-paper">
                        Popular
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs text-ink-dim">{p.desc}</p>
                </div>
                <div className="mb-6 flex items-baseline">
                  <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
                  <span className="ml-1 text-sm text-ink-soft">{p.per}</span>
                </div>
                <ul className="mb-7 flex-1 space-y-2.5 text-sm text-ink">
                  {p.items.map((it) => (
                    <li key={it} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                      {it}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.href}
                  className={[
                    "block w-full rounded-lg px-4 py-2.5 text-center text-sm font-medium transition",
                    p.featured
                      ? "bg-ink text-paper hover:bg-ink-2"
                      : "border border-line-2 hover:bg-paper-alt"
                  ].join(" ")}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-4xl px-6 py-32 text-center">
          <h2 className="text-balance text-[clamp(2.25rem,5vw,4.25rem)] font-semibold tracking-[-0.025em] leading-[1.05]">
            Stop fighting the timeline. Start shipping videos.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-dim">
            Try Editron free. No credit card, no waitlist.
          </p>
          <Link
            href="/signup"
            className="mt-10 inline-flex items-center gap-2 rounded-lg bg-ink px-7 py-4 text-sm font-medium text-paper transition hover:bg-ink-2"
          >
            Try for free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* footer */}
      <footer className="border-b border-line">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-6 py-14 md:grid-cols-4">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-ink">
                <span className="text-sm font-bold text-paper">e</span>
              </div>
              <span className="font-semibold">Editron</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-ink-dim">
              Conversation-driven video editing. Drop the footage, describe the cut, ship.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink">Product</h4>
            <ul className="space-y-2.5 text-sm text-ink-dim">
              <li><a href="#how" className="hover:text-ink">How it works</a></li>
              <li><a href="#features" className="hover:text-ink">Features</a></li>
              <li><a href="#pricing" className="hover:text-ink">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink">Company</h4>
            <ul className="space-y-2.5 text-sm text-ink-dim">
              <li><Link href="/login" className="hover:text-ink">Sign in</Link></li>
              <li><Link href="/signup" className="hover:text-ink">Sign up</Link></li>
              <li><a href="mailto:hello@editron.video" className="hover:text-ink">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl items-center justify-between border-t border-line px-6 py-6 text-xs text-ink-soft">
          <span>© 2026 Editron.</span>
          <span>Made where the footage lives.</span>
        </div>
      </footer>
    </main>
  );
}
