"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpRight } from "lucide-react";

export default function DesignSanityPage() {
  return (
    <div className="mx-auto max-w-6xl px-8 py-24">
      <div className="mb-16 max-w-xl">
        <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-ink-dim">
          Design system
        </p>
        <h1 className="font-serif text-4xl font-normal leading-tight tracking-tightish md:text-5xl">
          Editron <span className="italic">primitives</span>.
        </h1>
      </div>

      {/* Typography */}
      <section className="mb-16 border-t border-line pt-8" data-testid="section-typography">
        <p className="mb-6 text-[11px] uppercase tracking-[0.22em] text-ink-dim">
          Typography
        </p>
        <h2 className="mb-4 font-serif text-[clamp(2.75rem,4.4vw,4.5rem)] font-normal leading-[0.95] tracking-tightest">
          Hero <span className="italic">headline</span>.
        </h2>
        <h3 className="mb-4 font-serif text-4xl font-normal leading-tight tracking-tightish md:text-5xl">
          Section <span className="italic">headline</span>.
        </h3>
        <h4 className="mb-4 font-serif text-3xl font-normal leading-tight tracking-tightish">
          Card <span className="italic">headline</span>.
        </h4>
        <p className="mb-2 max-w-2xl text-lg leading-relaxed text-ink-soft">
          Body copy in Inter. The editorial feel of this design system comes
          from generous whitespace, confident serif headlines, and restrained
          use of color. This paragraph demonstrates the primary body style.
        </p>
        <p className="mb-2 text-sm text-ink-dim">
          Caption text — smaller, dimmer, used for meta information.
        </p>
        <p className="font-mono text-sm text-ink-soft">
          00:01:23.456 — Monospace for timecodes and transcripts
        </p>
      </section>

      {/* Colors */}
      <section className="mb-16 border-t border-line pt-8" data-testid="section-colors">
        <p className="mb-6 text-[11px] uppercase tracking-[0.22em] text-ink-dim">
          Color tokens
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {[
            { name: "ink", bg: "bg-ink", text: "text-paper" },
            { name: "ink-soft", bg: "bg-ink-soft", text: "text-paper" },
            { name: "ink-dim", bg: "bg-ink-dim", text: "text-paper" },
            { name: "paper", bg: "bg-paper", text: "text-ink" },
            { name: "paper-alt", bg: "bg-paper-alt", text: "text-ink" },
            { name: "accent", bg: "bg-accent", text: "text-paper" },
            { name: "accent-dark", bg: "bg-accent-dark", text: "text-paper" },
          ].map((c) => (
            <div
              key={c.name}
              className={`${c.bg} ${c.text} flex h-20 items-end rounded-lg border border-line p-3 text-sm font-medium`}
            >
              {c.name}
            </div>
          ))}
        </div>
      </section>

      {/* Buttons */}
      <section className="mb-16 border-t border-line pt-8" data-testid="section-buttons">
        <p className="mb-6 text-[11px] uppercase tracking-[0.22em] text-ink-dim">
          Buttons
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button>
            Try for free <ArrowUpRight className="h-4 w-4" />
          </Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost link</Button>
          <Button size="sm">Small pill</Button>
          <Button size="lg">
            Large pill <ArrowUpRight className="h-4 w-4" />
          </Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      {/* Card */}
      <section className="mb-16 border-t border-line pt-8" data-testid="section-card">
        <p className="mb-6 text-[11px] uppercase tracking-[0.22em] text-ink-dim">
          Card
        </p>
        <div className="grid gap-8 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>For trying Editron</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-serif text-5xl">$0</p>
              <ul className="mt-8 space-y-3 text-sm text-ink-soft">
                <li>— 10 minutes of render / month</li>
                <li>— 720p export</li>
              </ul>
            </CardContent>
            <CardFooter>
              <a className="text-sm font-medium underline-offset-4 hover:underline">
                Start →
              </a>
            </CardFooter>
          </Card>
          <Card className="border-t-2 border-accent">
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>For creators shipping weekly</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-serif text-5xl">$29</p>
              <ul className="mt-8 space-y-3 text-sm text-ink-soft">
                <li>— 120 minutes of render / month</li>
                <li>— 4K export</li>
              </ul>
            </CardContent>
            <CardFooter>
              <a className="text-sm font-medium underline-offset-4 hover:underline">
                Start →
              </a>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
              <CardDescription>For production houses</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-serif text-5xl">$99</p>
              <ul className="mt-8 space-y-3 text-sm text-ink-soft">
                <li>— Unlimited render</li>
                <li>— 4K export</li>
              </ul>
            </CardContent>
            <CardFooter>
              <a className="text-sm font-medium underline-offset-4 hover:underline">
                Start →
              </a>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Input + Label + Textarea */}
      <section className="mb-16 border-t border-line pt-8" data-testid="section-inputs">
        <p className="mb-6 text-[11px] uppercase tracking-[0.22em] text-ink-dim">
          Inputs
        </p>
        <div className="max-w-sm space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brief">Project brief</Label>
            <Textarea
              id="brief"
              placeholder="Describe your project..."
              rows={4}
            />
          </div>
        </div>
      </section>

      {/* Dialog */}
      <section className="mb-16 border-t border-line pt-8" data-testid="section-dialog">
        <p className="mb-6 text-[11px] uppercase tracking-[0.22em] text-ink-dim">
          Dialog
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm export</DialogTitle>
              <DialogDescription>
                This will render your project at 1080p and deliver a
                downloadable MP4 within a few minutes.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button>Export now</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      {/* Section pattern demo */}
      <section className="border-t border-line pt-8" data-testid="section-pattern">
        <p className="mb-6 text-[11px] uppercase tracking-[0.22em] text-ink-dim">
          Section pattern
        </p>
        <p className="max-w-2xl text-lg leading-relaxed text-ink-soft">
          Every section follows the eyebrow → serif headline with italic
          ending → content pattern. Backgrounds alternate paper and white for
          subtle rhythm.
        </p>
      </section>
    </div>
  );
}
