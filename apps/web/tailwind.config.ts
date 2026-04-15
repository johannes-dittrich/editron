import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"]
      },
      colors: {
        ink: "#0a0a0a",
        "ink-soft": "#3a3a3a",
        "ink-dim": "#6b6b6b",
        paper: "#fafaf7",
        line: "rgba(10, 10, 10, 0.14)",
        accent: {
          DEFAULT: "#ff5a1f",
          dark: "#d94410"
        },
        canvas: "#fafaf7"
      },
      letterSpacing: {
        tightest: "-0.045em",
        tightish: "-0.02em"
      }
    }
  },
  plugins: []
};

export default config;
