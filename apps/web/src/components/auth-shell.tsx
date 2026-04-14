import Link from "next/link";
import { Chrome, LockKeyhole, Mail } from "lucide-react";
import { Logo } from "./logo";

export function AuthShell({
  title,
  subtitle,
  submitLabel,
  footer,
  includeName = false
}: {
  title: string;
  subtitle: string;
  submitLabel: string;
  footer: React.ReactNode;
  includeName?: boolean;
}) {
  return (
    <main className="min-h-screen bg-canvas px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="surface-card hero-grid relative overflow-hidden rounded-[32px] border border-white/10 p-8 lg:p-12">
          <div className="absolute inset-0 bg-noise opacity-80" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <Logo />
              <div className="mt-16 max-w-xl">
                <p className="text-sm uppercase tracking-[0.28em] text-accentSoft">Studio access</p>
                <h1 className="mt-6 text-4xl font-semibold leading-tight text-balance text-white lg:text-6xl">
                  Review cuts, direct the timeline, and export from one shared workspace.
                </h1>
                <p className="mt-6 max-w-lg text-base leading-7 text-zinc-400">
                  Editron brings draft generation, transcript review, grading, and collaboration into a professional dark workspace built for shipping video fast.
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["74%", "faster first draft"],
                ["4K", "final export support"],
                ["AI", "chat-driven timeline control"]
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-2xl font-semibold text-white">{value}</div>
                  <div className="mt-1 text-sm text-zinc-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-card rounded-[32px] border border-white/10 p-8 lg:p-10">
          <div className="mb-8">
            <Link href="/" className="inline-flex">
              <Logo />
            </Link>
            <h2 className="mt-10 text-3xl font-semibold text-white">{title}</h2>
            <p className="mt-3 text-zinc-400">{subtitle}</p>
          </div>

          <form className="space-y-4">
            {includeName ? (
              <label className="block">
                <span className="mb-2 block text-sm text-zinc-400">Full name</span>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <Mail className="h-4 w-4 text-zinc-500" />
                  <input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600" placeholder="Avery Chen" />
                </div>
              </label>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-sm text-zinc-400">Email</span>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <Mail className="h-4 w-4 text-zinc-500" />
                <input type="email" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600" placeholder="you@team.com" />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-zinc-400">Password</span>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <LockKeyhole className="h-4 w-4 text-zinc-500" />
                <input type="password" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600" placeholder="••••••••" />
              </div>
            </label>

            <button className="w-full rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ff6d1f]">
              {submitLabel}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs uppercase tracking-[0.25em] text-zinc-500">Or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10">
            <Chrome className="h-4 w-4" />
            Continue with Google
          </button>

          <div className="mt-8 text-sm text-zinc-400">{footer}</div>
        </section>
      </div>
    </main>
  );
}
