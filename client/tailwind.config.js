/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1d4ed8', // Confident Royal Blue
        secondary: '#0f172a', // Deep Slate
        background: '#f8fafc', // Crisp light background
        surface: '#f1f5f9' // Subtle panel background
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Orbitron"', '"Plus Jakarta Sans"', 'sans-serif'],
        brand: ['"Orbitron"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
