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
        centauro: {
          navy: "#1B2A4A",
          "navy-light": "#2D4470",
          gold: "#C9A84C",
          "gold-light": "#E5D17F",
          cream: "#F8F6F0",
        },
      },
    },
  },
  plugins: [],
};
export default config;
