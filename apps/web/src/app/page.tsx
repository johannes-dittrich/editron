import Link from "next/link";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";

// V4 — Editorial base (V1) with V3's split-hero layout and V3's hero copy
// Fraunces serif for headlines, Inter body, light mode, impeccable.style
// principles. Hero is now half copy / half product demo card.

export default function LandingPage() {
  return (
    <main className="bg-paper text-ink">
      {/* nav */}
      <nav className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-6">
          <a href="/" className="flex items-center gap-3">
            <img
              src="/logo.png?v=2"
              alt="Editron"
              className="h-9 w-auto"
            />
            <span className="font-serif text-2xl italic tracking-tight">editron</span>
          </a>
          <div className="hidden items-center gap-8 text-sm text-ink-soft md:flex">
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#pricing" className="hover:text-ink">Pricing</a>
            <Link href="/login" className="hover:text-ink">Sign in</Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-accent-dark"
            >
              Try for free <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* hero — V3 split layout with V1's editorial serif typography */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-8 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:py-32">
          {/* copy side — serif, editorial */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white/60 px-3 py-1 text-[11px] text-ink-dim">
              <Sparkles className="h-3 w-3 text-accent" />
              An AI video editor for people who write
            </div>

            <h1 className="font-serif text-[clamp(2.75rem,4.4vw,4.5rem)] font-normal leading-[0.95] tracking-tightest text-ink">
              Drop the footage.<br />
              Describe the cut.<br />
              <span className="italic">Ship the video.</span>
            </h1>

            <p className="mt-10 max-w-lg text-lg leading-relaxed text-ink-soft">
              Upload your footage. Describe what you want in plain English.
              Editron transcribes, picks the cuts, grades, adds subtitles,
              and exports. The first decisions happen on the audio — because
              that&apos;s where they should.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 text-base font-medium text-paper hover:bg-accent-dark"
              >
                Try for free <ArrowUpRight className="h-4 w-4" />
              </Link>
              <a
                href="#how"
                className="text-base text-ink-soft underline-offset-4 hover:text-ink hover:underline"
              >
                See how it works ↓
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-5 text-xs text-ink-dim">
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

          {/* demo side — V3 product demo card */}
          <div className="relative">
            <div className="overflow-hidden rounded-lg border border-ink/20 bg-white shadow-[0_40px_80px_-20px_rgba(10,10,10,0.15),0_0_0_1px_rgba(10,10,10,0.05)]">
              <div className="flex items-center gap-2 border-b border-line bg-paper-alt px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </div>
                <span className="ml-2 font-mono text-[10px] text-ink-dim">editron / launch-video.proj</span>
              </div>

              <div className="border-b border-line bg-ink p-5">
                <div className="flex aspect-video items-center justify-center overflow-hidden rounded bg-paper-warm">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink">
                      <div className="ml-1 h-0 w-0 border-y-[9px] border-l-[15px] border-y-transparent border-l-ink" />
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-dim">
                      720p preview · 58s
                    </div>
                  </div>
                </div>
              </div>

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

              <div className="border-t border-line bg-paper p-4">
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5 text-xs">
                    <span className="mt-0.5 rounded-sm bg-ink px-1.5 py-0.5 font-mono text-[10px] font-semibold text-paper">
                      you
                    </span>
                    <span className="text-ink">tighten the hook, warmer grade</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs">
                    <span className="mt-0.5 rounded-sm bg-accent px-1.5 py-0.5 font-mono text-[10px] font-semibold text-paper">
                      editron
                    </span>
                    <span className="text-ink-soft italic">
                      tightened. grade shifted +warmth. ready to preview.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-3 -top-3 rounded-md border border-ink/20 bg-white px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-accent shadow-sm">
              live
            </div>
          </div>
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="border-b border-line bg-white">
        <div className="mx-auto max-w-6xl px-8 py-24">
          <div className="mb-16 max-w-xl">
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-ink-dim">The workflow</p>
            <h2 className="font-serif text-4xl font-normal leading-tight tracking-tightish md:text-5xl">
              From raw clips to final export<br />
              in <span className="italic">three steps</span>.
            </h2>
          </div>

          <ol className="space-y-16">
            <li className="grid grid-cols-12 gap-8">
              <div className="col-span-12 md:col-span-1">
                <span className="font-serif text-3xl italic text-ink-dim">01</span>
              </div>
              <div className="col-span-12 md:col-span-11">
                <h3 className="font-serif text-3xl font-normal leading-tight tracking-tightish">
                  Set the context.
                </h3>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
                  Drop a reference video in the style you want. Add a voice memo or a short brief: what the video
                  is about, how it should be structured, who it&apos;s for. Upload your raw footage alongside.
                  Editron reads all of it before it proposes a single cut.
                </p>
              </div>
            </li>

            <li className="grid grid-cols-12 gap-8">
              <div className="col-span-12 md:col-span-1">
                <span className="font-serif text-3xl italic text-ink-dim">02</span>
              </div>
              <div className="col-span-12 md:col-span-11">
                <h3 className="font-serif text-3xl font-normal leading-tight tracking-tightish">
                  Approve the strategy.
                </h3>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
                  Editron proposes a shape — hook, setup, payoff, CTA — picks the best takes from what you
                  uploaded, and tells you in four sentences what it would build. You approve, iterate, or
                  redirect. No edits happen until you&apos;ve agreed on the plan.
                </p>
              </div>
            </li>

            <li className="grid grid-cols-12 gap-8">
              <div className="col-span-12 md:col-span-1">
                <span className="font-serif text-3xl italic text-ink-dim">03</span>
              </div>
              <div className="col-span-12 md:col-span-11">
                <h3 className="font-serif text-3xl font-normal leading-tight tracking-tightish">
                  Ship the cut.
                </h3>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
                  720p preview in seconds. Word-level iteration in plain English. Final render with color grade,
                  subtitles, and loudness normalization when you say <span className="italic">ship</span>. Export
                  to your destination of choice.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* before / after */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-8 py-24">
          <div className="mb-16 max-w-xl">
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-ink-dim">A raw take, an edit</p>
            <h2 className="font-serif text-4xl font-normal leading-tight tracking-tightish md:text-5xl">
              You see the words.<br />
              Editron sees the cuts.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <div>
              <p className="mb-4 text-[11px] uppercase tracking-[0.22em] text-ink-dim">Before — raw transcript</p>
              <div className="border border-line bg-paper p-6 font-mono text-sm leading-relaxed text-ink-soft">
                <p>
                  <span className="text-ink-dim">[00:02]</span> So, um, ninety percent —{" "}
                  <span className="line-through decoration-ink/40">no sorry, let me start over —</span> ninety
                  percent of what a web agent does is, you know, completely wasted.
                </p>
                <p className="mt-3">
                  <span className="text-ink-dim">[00:11]</span>{" "}
                  <span className="line-through decoration-ink/40">Uh, so what we did —</span> We fixed this.
                </p>
                <p className="mt-3">
                  <span className="text-ink-dim">[00:14]</span>{" "}
                  <span className="line-through decoration-ink/40">Um,</span> Editron reasons on the audio first,
                  then the visuals follow.
                </p>
              </div>
            </div>

            <div>
              <p className="mb-4 text-[11px] uppercase tracking-[0.22em] text-ink-dim">After — the cut</p>
              <div className="border border-ink bg-ink p-6 font-mono text-sm leading-relaxed text-paper">
                <p>
                  <span className="text-paper/50">[00:00]</span> Ninety percent of what a web agent does is
                  completely wasted.
                </p>
                <p className="mt-3">
                  <span className="text-paper/50">[00:06]</span> We fixed this.
                </p>
                <p className="mt-3">
                  <span className="text-paper/50">[00:08]</span> Editron reasons on the audio first, then the
                  visuals follow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* pricing */}
      <section id="pricing" className="border-b border-line bg-white">
        <div className="mx-auto max-w-6xl px-8 py-24">
          <div className="mb-16 max-w-xl">
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-ink-dim">Pricing</p>
            <h2 className="font-serif text-4xl font-normal leading-tight tracking-tightish md:text-5xl">
              Free to try.<br />
              <span className="italic">Pay when it ships.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <div className="border-t border-ink pt-6">
              <h3 className="font-serif text-2xl">Free</h3>
              <p className="mt-2 text-sm text-ink-dim">For trying Editron</p>
              <p className="mt-6 font-serif text-5xl">$0</p>
              <ul className="mt-8 space-y-3 text-sm text-ink-soft">
                <li>— 10 minutes of render / month</li>
                <li>— 720p previews</li>
                <li>— One project</li>
              </ul>
              <Link
                href="/signup"
                className="mt-10 block text-sm font-medium underline-offset-4 hover:underline"
              >
                Start →
              </Link>
            </div>

            <div className="border-t-2 border-accent pt-6">
              <h3 className="font-serif text-2xl">Creator</h3>
              <p className="mt-2 text-sm text-ink-dim">For founders and solo creators</p>
              <p className="mt-6 font-serif text-5xl">
                $24<span className="text-lg text-ink-dim"> /mo</span>
              </p>
              <ul className="mt-8 space-y-3 text-sm text-ink-soft">
                <li>— 10 hours of render / month</li>
                <li>— 4K final exports</li>
                <li>— Unlimited projects</li>
                <li>— Priority Scribe queue</li>
              </ul>
              <Link
                href="/signup?plan=creator"
                className="mt-10 block text-sm font-medium underline-offset-4 hover:underline"
              >
                Start →
              </Link>
            </div>

            <div className="border-t border-ink pt-6">
              <h3 className="font-serif text-2xl">Studio</h3>
              <p className="mt-2 text-sm text-ink-dim">For agencies and teams</p>
              <p className="mt-6 font-serif text-5xl">
                $96<span className="text-lg text-ink-dim"> /mo</span>
              </p>
              <ul className="mt-8 space-y-3 text-sm text-ink-soft">
                <li>— 40 hours of render / month</li>
                <li>— Brand kits and grading presets</li>
                <li>— Team seats &amp; shared project memory</li>
                <li>— SLA and onboarding</li>
              </ul>
              <a
                href="mailto:hello@editron.video"
                className="mt-10 block text-sm font-medium underline-offset-4 hover:underline"
              >
                Contact →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-8 py-32 text-center">
          <h2 className="font-serif text-5xl font-normal leading-tight tracking-tightest md:text-7xl">
            Stop fighting<br />
            <span className="italic">the timeline.</span>
          </h2>
          <Link
            href="/signup"
            className="mt-12 inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 text-base font-medium text-paper hover:bg-accent-dark"
          >
            Try for free <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* footer */}
      <footer>
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-8 py-12 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png?v=2" alt="Editron" className="h-10 w-auto opacity-70" />
            <p className="font-serif italic text-ink-dim">editron</p>
          </div>
          <p className="text-sm text-ink-dim">© 2026 Editron. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
