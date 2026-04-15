import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0a",
        "ink-soft": "#3a3a3a",
        "ink-dim": "#6b6b6b",
        paper: "#fafaf7",
        "paper-alt": "#f4f4f2",
        white: "#ffffff",
        line: "rgba(10,10,10,0.14)",
        accent: "#ff5a1f",
        "accent-dark": "#d94410",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Menlo", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.045em",
        tightish: "-0.02em",
      },
      maxWidth: {
        "6xl": "72rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
