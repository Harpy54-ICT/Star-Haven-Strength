import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Existing coming-soon page tokens (do not remove — used by app/page.tsx)
        "shs-dark": "#0D1F12",
        "shs-green": "#1B4332",
        "shs-gold": "#C9A84C",
        // Brand palette
        green: { DEFAULT: "#1B4332", light: "#2D6A4F", dark: "#0D2B1F" },
        gold: { DEFAULT: "#C9A84C", light: "#E8C97A", dark: "#A07832" },
        charcoal: { DEFAULT: "#1A1A1A" },
        grey: { light: "#F9FAFB", mid: "#E5E7EB", dark: "#4B5563" },
      },
      fontFamily: {
        display: ["var(--font-oswald)", "Oswald", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
