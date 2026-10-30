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
          bg: "#0b1120",
          panel: "#111827",
          card: "#1e293b",
          input: "#0f172a",
          border: "#334155",
          gold: "#f59e0b",
          green: "#10b981",
          blue: "#3b82f6",
          purple: "#8b5cf6",
          red: "#ef4444",
        },
      },
    },
  },
  plugins: [],
};
