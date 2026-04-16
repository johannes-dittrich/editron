// apiUrl() resolves the base URL for the editron api at runtime.
//
// Production priority order:
//   1. process.env.NEXT_PUBLIC_API_URL (baked at build time via env)
//   2. Explicit hostname-based prod detection (falls 1 wasn't passed to
//      the builder — Azin's buildkit doesn't always pass service env
//      vars into the docker build context)
//   3. Empty string (same-origin, for local dev + MSW mocking)
export function apiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "web-production-8c8f.4631dc.up.azin.host") {
      return "https://api-production.4631dc.up.azin.host";
    }
  }
  return "";
}
