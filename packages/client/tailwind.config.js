/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0A0F1C",
          900: "#0D1526",
          800: "#111D35",
          700: "#1A2A4A",
          600: "#243860",
        },
        sand: {
          DEFAULT: "#C8A55A",
          light: "#E0C97A",
          dark: "#A88A3E",
        },
        sea: {
          400: "#4DA8A8",
          500: "#3A8F8F",
          600: "#2A7070",
        },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', "Georgia", "serif"],
        mono: ['"DM Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
