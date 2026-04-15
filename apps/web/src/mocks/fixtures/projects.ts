import type { Project } from "@editron/shared";

export const projects: Project[] = [
  {
    id: "proj_01",
    userId: "usr_01",
    title: "Launch Video v2",
    brief: "60-second product launch video for social. Punchy, fast cuts, founder talking head with b-roll overlay.",
    briefAudioKey: null,
    referenceKey: "ref/proj_01/reference.mp4",
    status: "ready",
    createdAt: "2026-04-01T09:00:00Z",
    updatedAt: "2026-04-12T16:30:00Z",
  },
  {
    id: "proj_02",
    userId: "usr_01",
    title: "Onboarding Walkthrough",
    brief: null,
    briefAudioKey: "brief/proj_02/memo.webm",
    referenceKey: null,
    status: "ingesting",
    createdAt: "2026-04-10T14:00:00Z",
    updatedAt: "2026-04-14T11:00:00Z",
  },
  {
    id: "proj_03",
    userId: "usr_01",
    title: "Untitled Project",
    brief: null,
    briefAudioKey: null,
    referenceKey: null,
    status: "draft",
    createdAt: "2026-04-14T08:00:00Z",
    updatedAt: "2026-04-14T08:00:00Z",
  },
];
