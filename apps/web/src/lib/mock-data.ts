import { DEFAULT_TIMELINE, PLANS, type AIChatMessage } from "@editron/shared";

export const dashboardProjects = [
  {
    id: "project-demo",
    title: "Spring Campaign Launch",
    updatedAt: "4 minutes ago",
    duration: "02:18",
    status: "In edit",
    gradient: "from-[#ff5a00]/50 via-[#ff8c4d]/20 to-transparent"
  },
  {
    id: "project-case-study",
    title: "Founder Case Study",
    updatedAt: "Yesterday",
    duration: "07:42",
    status: "Review",
    gradient: "from-sky-500/40 via-cyan-400/10 to-transparent"
  },
  {
    id: "project-social-cut",
    title: "Reel Cutdown Pack",
    updatedAt: "2 days ago",
    duration: "00:46",
    status: "Ready",
    gradient: "from-emerald-500/40 via-lime-400/10 to-transparent"
  },
  {
    id: "project-webinar",
    title: "Webinar Highlights",
    updatedAt: "5 days ago",
    duration: "11:09",
    status: "Draft",
    gradient: "from-fuchsia-500/40 via-rose-400/10 to-transparent"
  }
];

export const featureCards = [
  {
    title: "Text-to-edit commands",
    copy: "Type or dictate the change. Editron converts intent into timeline moves, cuts, captions, and grade adjustments."
  },
  {
    title: "Scene-aware assembly",
    copy: "Speech, silence, pacing, and visual change detection combine into draft timelines that feel intentionally cut."
  },
  {
    title: "Transcript-native review",
    copy: "Jump through footage by phrase, not by waveform hunting. Comments and revisions map cleanly to transcript ranges."
  },
  {
    title: "Fast exports",
    copy: "Queue delivery for MP4, MOV, and WebM with presets that match short-form, landscape, and client review workflows."
  },
  {
    title: "Integrated grading",
    copy: "Use the existing video engine helpers to apply safe cleanup grades or push a stronger creative preset when needed."
  },
  {
    title: "Team-ready projects",
    copy: "Projects, timelines, media, renders, and subscriptions all live in one monorepo-backed product foundation."
  }
];

export const pricingPlans = [PLANS.free, PLANS.pro, PLANS.business];

export const sampleMessages: AIChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content: "I found a tighter opening beat. Want me to cut the first pause, add subtitles, and grade the intro with a subtle warm preset?",
    timestamp: "09:41"
  },
  {
    id: "2",
    role: "user",
    content: "Yes. Also punch in on the second sentence and make the CTA line end on beat.",
    timestamp: "09:42"
  },
  {
    id: "3",
    role: "assistant",
    content: "Done in draft form. The timeline now trims 0.8s from the head, adds a 108% scale punch-in, and shifts the CTA clip to land on the marker at 00:26:12.",
    timestamp: "09:42"
  }
];

export const mediaLibrary = [
  { id: "media-1", name: "Interview_A001.mov", meta: "4K · 2.1 GB · 03:12" },
  { id: "media-2", name: "Product_Broll_03.mp4", meta: "4K · 684 MB · 00:47" },
  { id: "media-3", name: "Brand_Music_Bed.wav", meta: "48 kHz · 32 MB · 02:20" },
  { id: "media-4", name: "Lower_Third.png", meta: "PNG · 1.4 MB · Graphic" }
];

export const editorTimeline = DEFAULT_TIMELINE;
