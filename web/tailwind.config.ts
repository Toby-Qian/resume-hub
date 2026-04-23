import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./templates/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--resume-font-sans)", "ui-sans-serif", "system-ui"],
        serif: ["var(--resume-font-serif)", "ui-serif", "Georgia"],
      },
      colors: {
        accent: "var(--resume-accent)",
      },
    },
  },
  plugins: [],
} satisfies Config;
