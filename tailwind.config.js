/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        astro: {
          dark: "#080c16",
          card: "#0f172a",
          border: "#1e293b",
          cyan: "#00f0ff",
          purple: "#a855f7",
          gold: "#eab308",
        },
      },
    },
  },
  plugins: [],
};
