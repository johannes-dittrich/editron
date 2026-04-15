# Editron Design System

The canonical visual language for everything Editron ships on the web —
marketing pages, app UI, emails, anything. This is **prescriptive**: follow
it, don't reinvent. The design direction is locked to the V4 landing
variant. When in doubt, look at `apps/web/src/app/page.tsx` on the
`staging/fe-landing-v4` branch for the reference implementation.

## Principles (follow these, not the individual rules)

1. **Editorial, not corporate.** The site looks like a design magazine
   first and a product landing page second. Generous whitespace,
   confident typography, long line lengths for body copy, single-
   statement headlines.
2. **Light mode only.** No dark mode toggle. The whole brand lives in a
   paper-and-ink universe.
3. **No decoration for decoration's sake.** If a gradient, shadow, or
   animation doesn't communicate something, it doesn't exist. Every
   element earns its place.
4. **The product demo IS the hero.** Never hide what Editron does behind
   a stock photo or an abstract illustration. Show a real cut, a real
   transcript, a real preview.
5. **Serif for the voice, sans for the information, mono for the data.**
   Three font families, each with one job.
6. **Content density over empty cards.** A dense grid of real text beats
   a sparse grid of feature-card titles every time.

## Anti-patterns (never do these)

- ❌ Purple gradients, rainbow gradients, radial glows
- ❌ Dark mode / dark backgrounds on marketing pages
- ❌ Nested cards (a card inside a card inside a section)
- ❌ Generic icon-card feature grids ("⚡ Fast · 🔒 Secure · 🎨 Beautiful")
- ❌ Emoji sprayed across UI (reserve for tonal moments, never as icons)
- ❌ Stock photos of laptops, diverse teams, abstract data
- ❌ Soft shadows everywhere — use ONE deep shadow on the demo card, nothing else
- ❌ Parallax, scroll-jacking, cursor followers, particle effects
- ❌ Three-color split-complementary palettes — we're two-color (ink + accent)
- ❌ Rounded-2xl / rounded-3xl on content blocks. Rounded-lg max, or sharp.

---

## Color tokens

Defined in `tailwind.config.ts` and exposed as CSS custom properties in
`globals.css`. **Never hardcode hex values in components** — always use
the token.

| Token | Hex | Use |
|---|---|---|
| `ink` | `#0a0a0a` | Primary text, headlines, hero text, nav text, solid buttons |
| `ink-soft` | `#3a3a3a` | Body copy, secondary text, nav links |
| `ink-dim` | `#6b6b6b` | Meta, eyebrows, labels, captions |
| `paper` | `#fafaf7` | Default background (warm off-white) |
| `paper-alt` | `#f4f4f2` | Subtle section variations, demo card chrome |
| `white` | `#ffffff` | Alternating section background (how-it-works, pricing) |
| `line` | `rgba(10,10,10,0.14)` | All borders — never pure black, never white |
| `accent` | `#ff5a1f` | Exactly ONE highlight color. Used sparingly. |
| `accent-dark` | `#d94410` | Primary button hover only |

**Usage rules:**
- The only "strong" color is `accent`. Budget: ~5 uses per viewport. Key
  moments only: primary CTA button, eyebrow labels, one highlight span,
  the `live` badge on the demo.
- Never mix `accent` with any other hue. If you need a second visual
  channel, use `ink` + border weight, not a second color.
- Section backgrounds alternate `paper` ↔ `white` so the page has subtle
  rhythm without drawing a box around each section.

---

## Typography

Three families, no more:

| Family | Role | Google Fonts name | CSS variable |
|---|---|---|---|
| **Fraunces** | Display serif for headlines + brand wordmark | `Fraunces` (both regular and italic weights) | `--font-serif` |
| **Inter** | Body copy, UI labels, nav, buttons | `Inter` | `--font-sans` |
| **JetBrains Mono** | Timecodes, transcripts, code, CLI demos | `JetBrains_Mono` | `--font-mono` |

Loaded via `next/font/google` in `apps/web/src/app/layout.tsx`. Reference:

```tsx
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-serif", display: "swap", style: ["normal", "italic"] });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
```

### Type scale

Hero headline — always Fraunces, `font-normal`:
```
text-[clamp(2.75rem,4.4vw,4.5rem)] leading-[0.95] tracking-tightest
```

Section headlines — Fraunces, `font-normal`:
```
text-4xl md:text-5xl leading-tight tracking-tightish
```

Step / card headline — Fraunces, `font-normal`:
```
text-3xl leading-tight tracking-tightish
```

Body — Inter, sans-serif:
```
text-lg leading-relaxed text-ink-soft      // primary body
text-sm text-ink-dim                        // captions
text-[11px] uppercase tracking-[0.22em] text-ink-dim   // eyebrow labels
```

Mono is **only** for: transcript blocks, timestamps, CLI commands, data
tables with numeric content. Never for normal copy.

### Rules

- **Italic is part of the brand.** Every hero headline ends with an
  italic beat: "Ship the video.", "Pay when it ships.", "three steps."
  Fraunces italic is distinctive — use it for the final punchline of
  each big section headline.
- **Tracking gets tighter as size grows.** `tracking-tightest` (-0.045em)
  for hero, `tracking-tightish` (-0.02em) for section headlines, default
  for body. No negative tracking on body copy.
- **Line length limit.** Body copy wraps at ~58-72 characters. Enforce
  with `max-w-2xl` (body) or `max-w-xl` (section intro).
- **One headline per section.** Never stack a serif `<h2>` above another
  serif `<h3>` without at least one sans paragraph between them.

---

## Layout

- **Max content width: `max-w-6xl`** (72rem = 1152px). Every main content
  block uses this. Only the outermost nav and footer extend edge to
  edge.
- **Gutter: `px-8`** on desktop, `px-6` on mobile, always via responsive
  Tailwind.
- **Vertical rhythm: `py-24` for standard sections**, `py-32` for hero
  and final CTA. Never `py-20` or `py-28` — stick to the 8-rhythm.
- **Grid gutters: `gap-16` for hero split, `gap-10` for side-by-side
  content blocks, `gap-8` for tight component grids.**

### Section pattern

Every section follows this pattern:

```tsx
<section id="..." className="border-b border-line bg-...">
  <div className="mx-auto max-w-6xl px-8 py-24">
    <div className="mb-16 max-w-xl">
      <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-ink-dim">
        {eyebrow}
      </p>
      <h2 className="font-serif text-4xl font-normal leading-tight tracking-tightish md:text-5xl">
        {headline} <span className="italic">{italic-ending}</span>.
      </h2>
    </div>
    {/* section content */}
  </div>
</section>
```

The **eyebrow** (11px uppercase) introduces every section. The **max-w-xl**
on the intro block keeps the headline from stretching too wide. The
**italic ending** punctuates the headline.

Backgrounds alternate `bg-paper` (default) → `bg-white` → `bg-paper` → ... .
Never three of the same bg in a row.

---

## Components

### Primary CTA button

```tsx
<Link
  href="/signup"
  className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 text-base font-medium text-paper hover:bg-accent-dark"
>
  Try for free <ArrowUpRight className="h-4 w-4" />
</Link>
```

- Rounded-full (pill) — this is the signature shape
- `bg-ink` default, `hover:bg-accent-dark` on hover. The hover is the
  only place the accent color is allowed in motion.
- Icon: `ArrowUpRight` or `ArrowRight` from `lucide-react`, always 1rem
- Text: sentence case, never ALL CAPS, never "Get Started"

### Ghost CTA (secondary)

```tsx
<a href="#how" className="text-base text-ink-soft underline-offset-4 hover:text-ink hover:underline">
  See how it works ↓
</a>
```

No border, no background. Pure text link with underline on hover. Don't
mix bordered secondary buttons with the pill primary — the mix looks
chunky.

### Eyebrow label

```tsx
<p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-ink-dim">
  The workflow
</p>
```

Always 11px, uppercase, 0.22em tracking, `text-ink-dim`. Never center-
aligned — follow the content alignment.

### Pricing plan card

```tsx
<div className="border-t border-ink pt-6">
  <h3 className="font-serif text-2xl">Free</h3>
  <p className="mt-2 text-sm text-ink-dim">For trying Editron</p>
  <p className="mt-6 font-serif text-5xl">$0</p>
  <ul className="mt-8 space-y-3 text-sm text-ink-soft">
    <li>— 10 minutes of render / month</li>
  </ul>
  <Link className="mt-10 block text-sm font-medium underline-offset-4 hover:underline">
    Start →
  </Link>
</div>
```

- No rounded box, no shadow, no nested card. Just a `border-t` on top
  of each plan — the plans share a horizontal line.
- The featured plan uses `border-t-2 border-accent` instead of
  `border-t border-ink`.
- Plan name: Fraunces `text-2xl`. Price: Fraunces `text-5xl`. Features:
  bullet with em-dash, not checkmarks. **Avoid lucide Check icons in
  pricing blocks.**
- CTA: subtle underlined "Start →" link. Never a button in a pricing
  block.

### Demo / product mock card

This is the **ONE** place where shadow is allowed:

```tsx
<div className="overflow-hidden rounded-lg border border-ink/20 bg-white shadow-[0_40px_80px_-20px_rgba(10,10,10,0.15),0_0_0_1px_rgba(10,10,10,0.05)]">
  {/* chrome row with traffic light dots */}
  {/* preview pane with dark bg */}
  {/* transcript / data row */}
  {/* chat row */}
</div>
```

- `rounded-lg` (not -xl, not -2xl)
- Inner sections divided by `border-b border-line`
- Traffic-light dots: `#ff5f57` red, `#febc2e` amber, `#28c840` green
- Mono text inside the transcript rows at `text-[11px]`
- A small `live` badge tilts top-right at `-right-3 -top-3`

### Navigation

```tsx
<nav className="border-b border-line">
  <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-6">
    <div className="flex items-baseline gap-3">
      <span className="font-serif text-2xl italic tracking-tight">editron</span>
      <span className="text-[10px] uppercase tracking-[0.2em] text-ink-dim">issue 01</span>
    </div>
    {/* links + primary CTA */}
  </div>
</nav>
```

- Wordmark is Fraunces italic `text-2xl`, lowercase
- "issue 01" or equivalent subtle tag next to it — gives the editorial
  magazine feel
- Nav links: `text-sm text-ink-soft hover:text-ink`, `gap-8`
- Right-side: Sign in (ghost link) + Try for free (pill CTA)

### Footer

```tsx
<footer>
  <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-8 py-12 md:flex-row">
    <p className="font-serif italic text-ink-dim">editron — issue 01</p>
    <p className="text-sm text-ink-dim">© 2026 Editron. All rights reserved.</p>
  </div>
</footer>
```

Minimal. Two lines max. No link farm, no newsletter signup, no social
icon grid.

---

## Icons

- **Library:** `lucide-react` only. No Heroicons, no Phosphor, no custom
  SVGs unless for a specific purpose.
- **Size:** `h-4 w-4` for inline button/link icons, `h-3.5 w-3.5` for
  eyebrow inline, `h-5 w-5` for card-level icons.
- **Stroke weight:** Lucide default (1.5px). Don't bump it.
- **Allowed icons in the system:** `ArrowUpRight`, `ArrowRight`, `Check`,
  `Sparkles`. Introducing a new icon needs a reason in the PR
  description.

---

## Motion

- Hover transitions: **`hover:bg-accent-dark`** on primary CTA, **`hover:text-ink`** on links, **`hover:underline`** on ghost links. That's it.
- No CSS transitions on opacity, transform, or scale unless the change
  is >8px of motion and serves a function (e.g., the `live` badge tilt).
- **Framer Motion is allowed** for one thing only for V0: fade-in-from-
  bottom on hero content when the page mounts. No scroll-triggered
  animations.
- **Never** animate section entries on scroll. It looks 2019.

---

## Responsive rules

- **Breakpoints:** stick to Tailwind defaults. `md:` (768px) is the
  main mobile→tablet break, `lg:` (1024px) for tablet→desktop split
  layouts.
- Hero: single column on mobile, split 1.1fr / 0.9fr on `lg:`.
- Section headlines: `text-4xl` mobile, `md:text-5xl` desktop.
- Hero headline: `clamp(2.75rem, 4.4vw, 4.5rem)` — the floor of 2.75rem
  keeps mobile impactful.
- Nav: links collapse to invisible on mobile (no hamburger for V0 —
  mobile users tap the primary CTA).

---

## Accessibility

- **Contrast**: `ink` on `paper` = 19:1. `ink-soft` on `paper` = 11:1.
  `ink-dim` on `paper` = 6:1. All above WCAG AA. **Never put `ink-dim`
  text on `paper-alt` or lighter** — under 4.5:1.
- **Focus rings**: Tailwind's default `focus-visible:ring-2 ring-accent`
  on every interactive element. Add to the button/link base classes.
- **Selection color**: `::selection` uses solid `ink` background with
  `paper` text — already in globals.css.
- **Reduced motion**: if we add Framer Motion, wrap entry animations in
  `useReducedMotion` from framer-motion and skip them.

---

## File locations

| What | Where |
|---|---|
| CSS variables + base styles | `apps/web/src/app/globals.css` |
| Tailwind tokens + extend | `apps/web/tailwind.config.ts` |
| Font loading | `apps/web/src/app/layout.tsx` |
| Reference landing page | `apps/web/src/app/page.tsx` (landed from V4) |
| Component primitives | `apps/web/src/components/ui/` (shadcn when adopted) |

---

## Hard checks for every PR

Before the frontend agent labels any PR `ready`, confirm:

- [ ] No `text-white` or `bg-black` anywhere. Use `text-paper` / `bg-ink`.
- [ ] No purple, blue, green, or cyan anywhere. Accent is orange only.
- [ ] No nested cards (a bordered box inside a bordered box).
- [ ] Every section headline ends with an italic beat.
- [ ] Every section has an eyebrow label above the headline.
- [ ] Typography uses `font-serif` / `font-sans` / `font-mono` classes,
  never bare family names.
- [ ] No rounded-2xl or rounded-3xl on content blocks.
- [ ] No stock icons from other libraries (Heroicons, Feather, etc.).
- [ ] Every interactive element has a hover state.
- [ ] Primary CTA text reads "Try for free" + `ArrowUpRight`.
- [ ] Mobile at 375px width doesn't horizontally scroll.

If any box is unchecked, the PR is not ready.
