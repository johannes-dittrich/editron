import Link from "next/link";

// V2 — "Mono Terminal"
// JetBrains Mono primary, dev-tool aesthetic. Brutalist grid, sharp edges,
// high-density. Feels like a Linear-meets-Stripe-docs dev tool.

export default function LandingPage() {
  return (
    <main className="bg-paper text-ink font-mono">
      {/* nav */}
      <nav className="border-b-2 border-ink">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 bg-accent" />
            <span className="text-base font-bold tracking-tight">editron</span>
            <span className="ml-2 text-[10px] text-ink-dim">v0.1.0</span>
          </div>
          <div className="hidden items-center gap-6 text-xs uppercase tracking-widest md:flex">
            <a href="#flow" className="hover:text-accent">flow</a>
            <a href="#cli" className="hover:text-accent">cli</a>
            <a href="#pricing" className="hover:text-accent">pricing</a>
            <Link href="/login" className="hover:text-accent">sign in</Link>
            <Link href="/signup" className="border-2 border-ink bg-ink px-4 py-2 text-paper hover:bg-accent hover:border-accent">
              try_free
            </Link>
          </div>
        </div>
      </nav>

      {/* hero */}
      <section className="border-b-2 border-ink">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-24 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="mb-6 text-[10px] uppercase tracking-[0.3em] text-ink-dim">// video-editor v0.1.0 // conversation-first // 2026</p>
            <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-tight">
              $ editron<br />
              <span className="text-accent">--edit=&quot;ship this&quot;</span>
            </h1>
            <p className="mt-10 max-w-xl text-sm leading-relaxed text-ink-dim">
              A video editor for people who type. You describe the cut in
              plain English. Editron transcribes, picks the shots, grades,
              adds subtitles, exports. Audio is primary. Visuals follow.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/signup" className="border-2 border-ink bg-ink px-6 py-3 text-sm font-bold uppercase tracking-wider text-paper hover:bg-accent hover:border-accent">
                [try_free] →
              </Link>
              <Link href="#cli" className="border-2 border-ink px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-ink hover:text-paper">
                [see_how]
              </Link>
            </div>
            <p className="mt-6 text-xs text-ink-mute">$ 10min/mo free · no card · $12/mo after</p>
          </div>

          <div className="md:col-span-5">
            <div className="border-2 border-ink bg-paper-alt">
              <div className="flex items-center gap-2 border-b-2 border-ink px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 border border-ink" />
                  <div className="h-3 w-3 border border-ink" />
                  <div className="h-3 w-3 border border-ink bg-accent" />
                </div>
                <span className="ml-2 text-[10px] uppercase tracking-[0.25em] text-ink-dim">editron@launch-video</span>
              </div>
              <div className="space-y-2 px-5 py-5 text-xs leading-relaxed">
                <div><span className="text-accent">you</span> <span className="text-ink">$</span> edit these takes into a 60s launch</div>
                <div className="text-ink-dim">→ transcribing 14 clips (scribe)</div>
                <div className="text-ink-dim">→ packing phrases → takes_packed.md</div>
                <div className="text-ink-dim">→ reading brief → reference/pacing</div>
                <div><span className="text-accent">editron</span> <span className="text-ink">&gt;</span> Shape: HOOK → PROBLEM → DEMO → CTA.</div>
                <div className="pl-4 text-ink">Warm grade. 2-word UPPERCASE subs.</div>
                <div className="pl-4 text-ink">Length: 58s. confirm?</div>
                <div><span className="text-accent">you</span> <span className="text-ink">$</span> yes · punchier hook</div>
                <div className="text-ink-dim">→ tightening hook · per-segment extract</div>
                <div className="text-ink-dim">→ grading · overlays · subs (last)</div>
                <div><span className="text-accent">✓</span> edit/final.mp4 · 58.4s</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* flow */}
      <section id="flow" className="border-b-2 border-ink dotgrid">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-14">
            <p className="text-[10px] uppercase tracking-[0.3em] text-ink-dim">// process //</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              /bin/ship_video <span className="text-accent">--in=raw --out=final</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              { n: "01", t: "context", c: "Reference video + brief (text or voice) + raw source. Editron reads all of it first." },
              { n: "02", t: "strategy", c: "Editron proposes shape in plain English — hook, setup, payoff. You approve or redirect." },
              { n: "03", t: "cut", c: "Audio-first. Cuts land on word boundaries. Per-segment extract + lossless concat." },
              { n: "04", t: "ship", c: "720p preview in seconds. Final 1080p on ship. Loudness normalized for social." }
            ].map((s) => (
              <div key={s.n} className="border-2 border-ink bg-paper p-5">
                <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-widest">
                  <span className="text-ink-dim">step.{s.n}</span>
                  <span className="text-accent">▶</span>
                </div>
                <h3 className="text-lg font-bold">{s.t}()</h3>
                <p className="mt-3 text-xs leading-relaxed text-ink-dim">{s.c}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* cli flags */}
      <section id="cli" className="border-b-2 border-ink">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="text-[10px] uppercase tracking-[0.3em] text-ink-dim">// flags //</p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            one verb, <span className="text-accent">many flags</span>.
          </h2>
          <div className="mt-14 grid grid-cols-1 gap-x-14 gap-y-10 md:grid-cols-2">
            {[
              { flag: "--transcribe", c: "ElevenLabs Scribe. Word-level, verbatim. Speaker diarization + audio events. Never re-transcribe the same source twice." },
              { flag: "--cut", c: "Snaps to word boundaries. 30-200ms padding. Per-segment extract, lossless concat. Never double-encodes." },
              { flag: "--grade", c: "Per-segment auto-grade from the actual frame stats. Warm cinematic, neutral punch, or invent your own filter chain." },
              { flag: "--subs", c: "2-word UPPERCASE for short-form. Sentence case for long-form. Applied LAST in the filter chain so overlays never cover them." },
              { flag: "--overlay", c: "PIL, Manim, or Remotion — generated in parallel sub-agents. PTS-shifted so the landing frame lands on the payoff word." },
              { flag: "--loudnorm", c: "Two-pass EBU R128. -14 LUFS, -1 dBTP, LRA 11. Ships at the level every social platform wants." }
            ].map((f) => (
              <div key={f.flag} className="border-l-2 border-ink pl-5">
                <code className="text-sm font-bold text-accent">{f.flag}</code>
                <p className="mt-2 text-xs leading-relaxed text-ink-dim">{f.c}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* pricing */}
      <section id="pricing" className="border-b-2 border-ink bg-paper-alt">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="text-[10px] uppercase tracking-[0.3em] text-ink-dim">// pricing //</p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            pay by the <span className="text-accent">minute</span>.
          </h2>
          <div className="mt-14 overflow-x-auto border-2 border-ink bg-paper">
            <table className="w-full text-left text-sm">
              <thead className="border-b-2 border-ink bg-paper-alt text-[10px] uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">plan</th>
                  <th className="px-6 py-4">render/mo</th>
                  <th className="px-6 py-4">export</th>
                  <th className="px-6 py-4">price</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="font-bold">
                <tr className="border-b border-line-soft">
                  <td className="px-6 py-5">free</td>
                  <td className="px-6 py-5 text-ink-dim">10min</td>
                  <td className="px-6 py-5 text-ink-dim">720p</td>
                  <td className="px-6 py-5">$0</td>
                  <td className="px-6 py-5 text-right">
                    <Link href="/signup" className="text-accent hover:underline">[start]</Link>
                  </td>
                </tr>
                <tr className="border-b border-line-soft bg-accent/10">
                  <td className="px-6 py-5">creator</td>
                  <td className="px-6 py-5 text-ink-dim">10hr</td>
                  <td className="px-6 py-5 text-ink-dim">4K</td>
                  <td className="px-6 py-5">$24/mo</td>
                  <td className="px-6 py-5 text-right">
                    <Link href="/signup?plan=creator" className="text-accent hover:underline">[start]</Link>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-5">studio</td>
                  <td className="px-6 py-5 text-ink-dim">40hr</td>
                  <td className="px-6 py-5 text-ink-dim">4K + brand</td>
                  <td className="px-6 py-5">$96/mo</td>
                  <td className="px-6 py-5 text-right">
                    <a href="mailto:hello@editron.video" className="text-accent hover:underline">[contact]</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-6xl px-6 py-32 text-center">
          <h2 className="text-5xl font-bold tracking-tight md:text-7xl">
            $ editron <span className="text-accent">--now</span>
          </h2>
          <Link href="/signup" className="mt-12 inline-block border-2 border-ink bg-ink px-8 py-4 text-sm font-bold uppercase tracking-widest text-paper hover:bg-accent hover:border-accent">
            [try_free] →
          </Link>
        </div>
      </section>

      {/* footer */}
      <footer>
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-6 py-8 text-xs md:flex-row">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 bg-accent" />
            <span>editron v0.1.0 — © 2026</span>
          </div>
          <div className="text-ink-dim">made in the terminal</div>
        </div>
      </footer>
    </main>
  );
}
