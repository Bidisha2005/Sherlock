/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1020",
        panel: "#12182a",
        panel2: "#171f35",
        line: "#273149",
        mint: "#4ade80",
        cyan: "#22d3ee",
        amber: "#fbbf24",
        rose: "#fb7185"
      }
    }
  },
  plugins: []
};
