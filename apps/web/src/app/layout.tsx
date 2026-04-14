import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Editron",
  description: "AI video editing SaaS for voice-driven editing, subtitles, grading, and fast exports."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
