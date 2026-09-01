import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "shs-dark": "#0D1F12",
        "shs-green": "#1B4332",
        "shs-gold": "#C9A84C",
      },
    },
  },
  plugins: [],
};

export default config;
