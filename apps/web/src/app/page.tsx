import Link from "next/link";
import { ArrowRight, Check, Clapperboard, MessageSquareText, Palette, Play, ScanSearch, Sparkles, Subtitles, WandSparkles } from "lucide-react";
import { featureCards, pricingPlans } from "@/lib/mock-data";
import { Logo } from "@/components/logo";

const steps = [
  {
    title: "Upload footage",
    copy: "Bring in interviews, b-roll, music, brand graphics, and transcripts. The media library is ready for full project organization."
  },
  {
    title: "Direct the AI",
    copy: "Tell Editron what you want in natural language: remove filler, find a sharper cold open, add captions, or shift pacing."
  },
  {
    title: "Polish and export",
    copy: "Review the timeline, trim the last details, and send a final export through the Fastify render pipeline."
  }
];

const icons = [MessageSquareText, ScanSearch, Subtitles, Palette, Sparkles, Clapperboard];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-canvas text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#workflow" className="transition hover:text-white">How it works</a>
            <a href="#pricing" className="transition hover:text-white">Pricing</a>
            <Link href="/login" className="transition hover:text-white">Login</Link>
            <Link href="/signup" className="rounded-full bg-accent px-5 py-2.5 font-semibold text-white transition hover:bg-[#ff6d1f]">
              Start free
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden px-6 pb-20 pt-14">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top,rgba(255,90,0,0.18),transparent_50%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-accentSoft">
              <WandSparkles className="h-4 w-4" />
              AI video post-production
            </div>
            <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[1.02] text-balance md:text-7xl">
              AI-Powered Video Editing
              <span className="mt-3 block bg-gradient-to-r from-white via-[#ffd0b6] to-[#ff5a00] bg-clip-text text-transparent">
                Edit videos with your voice, not your mouse
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
              Editron turns natural language into timeline edits, transcript cleanups, grading, and export-ready sequences so creative teams can move at review speed instead of tool speed.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-4 text-sm font-semibold text-white shadow-glow transition hover:bg-[#ff6d1f]">
                Start editing free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-4 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10">
                <Play className="h-4 w-4" />
                Open dashboard
              </Link>
            </div>
          </div>

          <div className="relative animate-float">
            <div className="surface-card hero-grid relative overflow-hidden rounded-[32px] border border-white/10 p-4 shadow-glow">
              <div className="absolute right-6 top-6 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-accentSoft">
                Live editor
              </div>
              <div className="rounded-[28px] border border-white/10 bg-[#0b0b0b] p-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                  <div className="h-3 w-3 rounded-full bg-rose-500/70" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/70" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/70" />
                  <div className="ml-3 text-xs uppercase tracking-[0.2em] text-zinc-500">Editron studio</div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[0.26fr_0.47fr_0.27fr]">
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-3">
                    <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Media</div>
                    <div className="mt-3 space-y-3">
                      {[54, 68, 76].map((width, index) => (
                        <div key={width} className="rounded-2xl border border-white/10 bg-black/30 p-3">
                          <div className="h-2 rounded-full bg-white/10" style={{ width: `${width}%` }} />
                          <div className="mt-3 h-1.5 rounded-full bg-accent/60" style={{ width: `${42 + index * 14}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-[#121212] p-3">
                    <div className="flex h-56 items-end justify-between rounded-[20px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,90,0,0.18),transparent_38%)] p-5">
                      <div>
                        <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Preview</div>
                        <div className="mt-2 text-2xl font-semibold">Launch cut v03</div>
                      </div>
                      <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-zinc-400">00:42</div>
                    </div>

                    <div className="mt-4 rounded-[20px] border border-white/10 bg-black/30 p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Timeline</div>
                        <div className="text-xs text-zinc-500">3 tracks</div>
                      </div>
                      <div className="mt-4 space-y-2">
                        {[["#ff5a00", "58%"], ["#1f6feb", "42%"], ["#22c55e", "28%"]].map(([color, width], index) => (
                          <div key={index} className="h-10 rounded-2xl border border-white/10 bg-black/20 p-1">
                            <div className="h-full rounded-xl" style={{ width, background: `linear-gradient(135deg, ${color}, rgba(255,255,255,0.16))` }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-3">
                    <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">AI chat</div>
                    <div className="mt-3 space-y-3">
                      {["Tighten the intro and cut dead air.", "Draft updated. Added subtitles and a gentle warm cleanup grade."].map((line, index) => (
                        <div key={line} className={`rounded-2xl border p-3 text-sm leading-6 ${index === 0 ? "border-accent/20 bg-accent/10 text-white" : "border-white/10 bg-black/30 text-zinc-300"}`}>
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-accentSoft">Features</p>
            <h2 className="mt-4 text-4xl font-semibold">A professional web editor wrapped around your AI video engine.</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-zinc-400">
            The product layer is built for serious workflows: dark interface, fast navigation, clear hierarchy, and controls that feel closer to a post-production suite than a toy generator.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((feature, index) => {
            const Icon = icons[index];
            return (
              <div key={feature.title} className="surface-card rounded-[28px] border border-white/10 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-4 text-sm leading-7 text-zinc-400">{feature.copy}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="workflow" className="border-y border-white/10 bg-black/20 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm uppercase tracking-[0.24em] text-accentSoft">How it works</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold">Three steps from raw footage to export-ready video.</h2>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="surface-card rounded-[28px] border border-white/10 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-lg font-semibold text-accent">
                  {index + 1}
                </div>
                <h3 className="mt-6 text-2xl font-semibold">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-zinc-400">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-accentSoft">Pricing</p>
            <h2 className="mt-4 text-4xl font-semibold">Choose the editing throughput that matches your team.</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-zinc-400">
            Start on Free, then move into Pro or Business when you need more storage, higher export quality, and heavier AI workloads.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div key={plan.id} className={`rounded-[30px] border p-7 ${plan.id === "pro" ? "border-accent/30 bg-gradient-to-b from-accent/10 to-white/5 shadow-glow" : "border-white/10 bg-white/5"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-2xl font-semibold">{plan.name}</div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{plan.description}</p>
                </div>
                {plan.id === "pro" ? (
                  <div className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-accentSoft">Popular</div>
                ) : null}
              </div>
              <div className="mt-8 flex items-end gap-2">
                <span className="text-5xl font-semibold">${plan.priceMonthly}</span>
                <span className="pb-2 text-zinc-500">/ month</span>
              </div>
              <div className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check className="h-4 w-4 text-accentSoft" />
                    {feature}
                  </div>
                ))}
              </div>
              <Link href="/signup" className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${plan.id === "pro" ? "bg-accent text-white hover:bg-[#ff6d1f]" : "border border-white/10 bg-black/20 text-white hover:border-white/20 hover:bg-white/5"}`}>
                {plan.id === "business" ? "Contact sales" : plan.id === "free" ? "Get started" : "Start free trial"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl rounded-[36px] border border-white/10 bg-gradient-to-r from-accent/15 via-white/5 to-transparent p-8 md:p-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.24em] text-accentSoft">Start now</p>
              <h2 className="mt-4 text-4xl font-semibold">Build the first draft in minutes, then refine where human taste matters.</h2>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/signup" className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ff6d1f]">
                Create account
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-black/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/5">
                Explore dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
          <Logo />
          <div className="flex flex-wrap gap-6">
            <Link href="/login" className="transition hover:text-white">Login</Link>
            <Link href="/signup" className="transition hover:text-white">Signup</Link>
            <Link href="/dashboard" className="transition hover:text-white">Dashboard</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
