import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        surface: "#0a0a0a",
        border: "#1f1f1f",
        primary: "#3b82f6", // Electric Blue
        accent: "#a855f7", // Purple
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #1f1f1f 1px, transparent 1px), linear-gradient(to bottom, #1f1f1f 1px, transparent 1px)",
        'glow-radial': "radial-gradient(circle at center, var(--tw-gradient-stops))",
      }
    },
  },
  plugins: [],
};
export default config;
