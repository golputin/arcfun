import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        arc: {
          bg: "#07090d",
          panel: "#0d1118",
          line: "#1b2330",
          muted: "#8b98a8",
          text: "#e8eef7",
          lime: "#b8f000",
          cyan: "#4de1ff",
          up: "#3ddc97",
          down: "#ff5c7a",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(184, 240, 0, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
