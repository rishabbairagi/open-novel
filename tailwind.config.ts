import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#eceff4",
        ink: "#12151c",
        mute: "#5a6275",
        line: "#d5dae4",
        accent: { DEFAULT: "#3340d8", soft: "#e3e6fb", deep: "#232d9e" },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [typography],
} satisfies Config;
