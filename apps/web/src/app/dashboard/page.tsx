"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@editron/shared";
import { apiUrl } from "@/lib/api-url";

type FetchState = "loading" | "success" | "error";

function StatusPill({ status }: { status: Project["status"] }) {
  const styles: Record<string, string> = {
    draft: "border-ink-dim text-ink-dim",
    ingesting: "border-accent text-accent",
    ready: "border-ink text-ink",
    archived: "border-ink-dim text-ink-dim",
  };
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] uppercase tracking-[0.15em] ${styles[status] ?? styles.draft}`}
    >
      {status}
    </span>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const updated = new Date(project.updatedAt);
  const relativeTime = formatRelative(updated);

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group border-t border-line pt-6 transition-colors hover:border-ink"
      data-testid="project-card"
    >
      <div className="mb-3 flex items-start justify-between">
        <h3 className="font-serif text-xl font-normal leading-tight">
          {project.title}
        </h3>
        <StatusPill status={project.status} />
      </div>
      <div className="mb-4 flex h-8 gap-1 overflow-hidden rounded">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 bg-paper-alt" />
        ))}
      </div>
      <p className="text-sm text-ink-dim">Updated {relativeTime}</p>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="border-t border-line pt-6" data-testid="skeleton-card">
      <div className="mb-3 flex items-start justify-between">
        <div className="h-6 w-40 animate-pulse rounded bg-paper-alt" />
        <div className="h-5 w-16 animate-pulse rounded-full bg-paper-alt" />
      </div>
      <div className="mb-4 flex h-8 gap-1 overflow-hidden rounded">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 animate-pulse bg-paper-alt" />
        ))}
      </div>
      <div className="h-4 w-28 animate-pulse rounded bg-paper-alt" />
    </div>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-medium text-paper hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        aria-label="User menu"
        data-testid="user-menu-button"
      >
        A
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-10 mt-2 w-48 rounded-lg border border-line bg-paper py-1 shadow-lg"
          data-testid="user-menu-dropdown"
        >
          <a
            href={`${apiUrl()}/api/auth/sign-out`}
            className="block px-4 py-2 text-sm text-ink-soft hover:bg-paper-alt hover:text-ink"
            data-testid="sign-out-link"
          >
            Sign out
          </a>
        </div>
      )}
    </div>
  );
}

function formatRelative(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [state, setState] = useState<FetchState>("loading");

  async function fetchProjects() {
    setState("loading");
    try {
      const res = await fetch(`${apiUrl()}/api/projects`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setProjects(data);
      setState("success");
    } catch {
      setState("error");
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

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
          <div className="flex items-center gap-4">
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              New project <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <UserMenu />
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-8 py-16">
        {state === "loading" && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {state === "error" && (
          <div
            className="mx-auto max-w-md text-center"
            data-testid="error-state"
          >
            <p className="text-lg text-ink-soft">
              couldn&apos;t load your projects.{" "}
              <button
                onClick={fetchProjects}
                className="text-ink underline-offset-4 hover:underline"
              >
                retry?
              </button>
            </p>
          </div>
        )}

        {state === "success" && projects.length === 0 && (
          <div
            className="mx-auto max-w-md py-24 text-center"
            data-testid="empty-state"
          >
            <h2 className="font-serif text-4xl font-normal leading-tight tracking-tightish md:text-5xl">
              Your first cut is a{" "}
              <span className="italic">tap away</span>.
            </h2>
            <Link
              href="/projects/new"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 text-base font-medium text-paper hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              New project <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {state === "success" && projects.length > 0 && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
