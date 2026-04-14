import Link from "next/link";
import { CreditCard, Film, Home, LogOut, Plus, Search, Settings, Sparkles, WandSparkles } from "lucide-react";
import { dashboardProjects } from "@/lib/mock-data";
import { Logo } from "./logo";

export function DashboardShell() {
  const navigation = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Projects", href: "#", icon: Film },
    { label: "AI Assist", href: "#", icon: Sparkles },
    { label: "Billing", href: "#", icon: CreditCard },
    { label: "Settings", href: "#", icon: Settings }
  ];

  return (
    <main className="min-h-screen bg-canvas text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-white/10 bg-black/20 p-6 lg:block">
          <Logo />
          <nav className="mt-10 space-y-1">
            {navigation.map(({ label, href, icon: Icon }, index) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${index === 0 ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-10">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-accent/20 via-accent/5 to-transparent p-5">
              <div className="text-sm font-semibold">Pro Workspace</div>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Unlimited projects, 4K export, and priority rendering are active on this demo account.
              </p>
            </div>
            <Link href="/login" className="mt-6 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white">
              <LogOut className="h-4 w-4" />
              Sign out
            </Link>
          </div>
        </aside>

        <section className="flex-1 p-6 lg:p-8">
          <div className="surface-card rounded-[28px] border border-white/10 p-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-accentSoft">Dashboard</p>
                <h1 className="mt-3 text-3xl font-semibold">Keep every cut, asset, and render moving.</h1>
                <p className="mt-3 max-w-2xl text-zinc-400">
                  Search projects, jump into the editor, and spin up a fresh workspace for the next campaign without leaving the product.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-400">
                  <Search className="h-4 w-4" />
                  <input className="w-full bg-transparent outline-none placeholder:text-zinc-600 sm:w-56" placeholder="Search projects, media, exports" />
                </div>
                <Link href="/editor/project-demo" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ff6d1f]">
                  <Plus className="h-4 w-4" />
                  New Project
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["12", "Active projects"],
              ["84 GB", "Storage in use"],
              ["03", "Exports in queue"]
            ].map(([value, label]) => (
              <div key={label} className="surface-card rounded-3xl border border-white/10 p-5">
                <div className="text-3xl font-semibold">{value}</div>
                <div className="mt-2 text-sm text-zinc-400">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
            <Link href="/editor/new" className="group flex min-h-[260px] flex-col items-center justify-center rounded-[28px] border border-dashed border-white/15 bg-black/20 p-6 text-center transition hover:border-accent/50 hover:bg-white/5">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/5 transition group-hover:border-accent/40 group-hover:bg-accent/10">
                <WandSparkles className="h-7 w-7 text-zinc-300 transition group-hover:text-accent" />
              </div>
              <div className="mt-5 text-lg font-semibold text-white">Start a new project</div>
              <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-400">
                Upload footage, ask the AI to rough cut, then move directly into timeline polish.
              </p>
            </Link>

            {dashboardProjects.map((project) => (
              <Link key={project.id} href={`/editor/${project.id}`} className="group overflow-hidden rounded-[28px] border border-white/10 bg-panel transition hover:border-white/20">
                <div className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${project.gradient}`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_35%)]" />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs uppercase tracking-[0.18em] text-zinc-300">
                    {project.status}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">Last updated {project.updatedAt}</div>
                    <div className="mt-2 text-xl font-semibold text-white">{project.title}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 text-sm text-zinc-400">
                  <span>{project.duration}</span>
                  <span className="text-zinc-500 transition group-hover:text-accentSoft">Open editor</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
