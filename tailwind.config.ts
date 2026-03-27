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
          blue: "#1E3A8A",
          "blue-light": "#2B4C9B",
          red: "#CC2229",
          "red-light": "#E03E3E",
          cream: "#F0F4F8",
        },
      },
    },
  },
  plugins: [],
};
export default config;
