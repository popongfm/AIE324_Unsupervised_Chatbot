/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f8fafc",
        card: "#ffffff",
        borderSubtle: "#e2e8f0",
        doss: {
          blue: "#2563eb",
          blueHover: "#1d4ed8",
          blueLight: "#eff6ff",
          blueBorder: "#bfdbfe",
          dark: "#0f172a",
          slate: "#334155",
          muted: "#64748b",
        },
      },
      boxShadow: {
        dossCard: "0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)",
        dossElevated: "0 12px 28px -4px rgba(15, 23, 42, 0.08), 0 4px 8px -2px rgba(15, 23, 42, 0.04)",
        dossGlow: "0 0 0 2px rgba(37, 99, 235, 0.15)",
        base44Card: "0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)",
      },
    },
  },
  plugins: [],
};
