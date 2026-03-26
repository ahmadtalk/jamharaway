import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  corePlugins: {
    preflight: false, // نتولى الـ reset بأنفسنا في globals.css
  },
  theme: {
    extend: {
      colors: {
        green: {
          50: "#F2FAF5",
          100: "#E8F6ED",
          200: "#C5E8D0",
          400: "#4CB36C",
          500: "#3A9558",
          600: "#2D7A46",
        },
        ink: {
          DEFAULT: "#1E2130",
          2: "#3A3F52",
          muted: "#6B7280",
        },
        navy: {
          DEFAULT: "#373C55",
          dark: "#2F3348",
        },
        rust: "#E05A2B",
        border: "#DBE3EA",
        "border-light": "#EDF1F5",
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "sans-serif"],
        ibm: ["var(--font-ibm)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
