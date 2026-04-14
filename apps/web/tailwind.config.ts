import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: "#0a0a0a",
        panel: "#111111",
        panelAlt: "#171717",
        line: "rgba(255,255,255,0.08)",
        accent: "#FF5A00",
        accentSoft: "#ff8c4d",
        copy: "#f4f4f5",
        muted: "#a1a1aa"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(255, 90, 0, 0.18)"
      },
      backgroundImage: {
        noise: "radial-gradient(circle at top, rgba(255,90,0,0.16), transparent 32%), linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        pulseLine: {
          "0%, 100%": { opacity: "0.35", transform: "scaleX(0.94)" },
          "50%": { opacity: "1", transform: "scaleX(1)" }
        },
        scan: {
          "0%": { transform: "translateX(-10%)" },
          "100%": { transform: "translateX(110%)" }
        }
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        pulseLine: "pulseLine 2.8s ease-in-out infinite",
        scan: "scan 4s linear infinite"
      },
      fontFamily: {
        sans: ["Sora", "Avenir Next", "Segoe UI", "sans-serif"],
        mono: ["IBM Plex Mono", "SFMono-Regular", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
