import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        card: "var(--card)",
        border: "var(--border)",
        muted: "var(--muted)",
        success: "var(--success)",
        warning: "var(--warning)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        "float": "float 3s ease-in-out infinite",
        "blink-cursor": "blink-cursor 1s step-end infinite",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "blink-cursor": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(0, 212, 170, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(0, 212, 170, 0.8), 0 0 40px rgba(0, 212, 170, 0.4)" },
        },
      },
      boxShadow: {
        "glow-primary": "0 0 20px rgba(0, 212, 170, 0.3), 0 0 40px rgba(0, 212, 170, 0.1)",
        "glow-secondary": "0 0 20px rgba(124, 58, 237, 0.3), 0 0 40px rgba(124, 58, 237, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
