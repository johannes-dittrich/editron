// All API calls go through the Next.js rewrite proxy at /api/*, which
// forwards to BACKEND_URL server-side. The browser always talks to the
// web origin — no cross-origin cookies, no CORS preflight.
export function apiUrl(): string {
  return "";
}
