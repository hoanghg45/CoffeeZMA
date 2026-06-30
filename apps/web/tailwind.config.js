/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--coffee-primary)",
        background: "var(--coffee-background)",
        surface: "var(--coffee-surface)",
        onSurface: "var(--coffee-on-surface)",
        onSurfaceVariant: "var(--coffee-on-surface-variant)",
        skeleton: "rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};
