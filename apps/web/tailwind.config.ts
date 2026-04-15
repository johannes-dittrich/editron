import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"],
      },
      colors: {
        ink: "#0a0a0a",
        "ink-soft": "#3a3a3a",
        "ink-dim": "#6b6b6b",
        paper: "#fafaf7",
        "paper-alt": "#f4f4f2",
        "paper-warm": "#f5f0eb",
        line: "rgba(10, 10, 10, 0.14)",
        accent: {
          DEFAULT: "#ff5a1f",
          dark: "#d94410",
        },
        canvas: "#0a0a0a",
        panel: "#111111",
        panelAlt: "#171717",
        accentSoft: "#ff8c4d",
        copy: "#f4f4f5",
        muted: "#a1a1aa",
      },
      letterSpacing: {
        tightest: "-0.045em",
        tightish: "-0.02em",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        scan: "scan 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
