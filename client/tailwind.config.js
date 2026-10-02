/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#07080c', // Pure Matte Obsidian
        surface: {
          DEFAULT: '#0d0e15',
          card: 'rgba(13, 14, 21, 0.7)',
          panel: '#11121c',
          high: '#181926',
          border: 'rgba(255, 255, 255, 0.08)',
          borderBright: 'rgba(255, 255, 255, 0.16)',
        },
        primary: {
          DEFAULT: '#10b981', // Emerald
          hover: '#059669',
          glow: '#34d399',
          soft: 'rgba(16, 185, 129, 0.12)',
        },
        secondary: {
          DEFAULT: '#06b6d4', // Cyan
          hover: '#0891b2',
          glow: '#38bdf8',
          soft: 'rgba(6, 182, 212, 0.12)',
        },
        violet: {
          DEFAULT: '#8b5cf6',
          hover: '#7c3aed',
          glow: '#a78bfa',
          soft: 'rgba(139, 92, 246, 0.14)',
        },
        obsidian: {
          950: '#030407',
          900: '#07080c',
          850: '#0d0e15',
          800: '#12141e',
          750: '#181a28',
          700: '#222538',
        }
      },
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'sans-serif'],
        display: ['Geist', 'Inter', 'sans-serif'],
        mono: ['"Geist Mono"', '"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-violet': '0 0 35px -5px rgba(139, 92, 246, 0.28)',
        'glow-cyan': '0 0 35px -5px rgba(6, 182, 212, 0.25)',
        'glow-emerald': '0 0 35px -5px rgba(16, 185, 129, 0.25)',
        'glow-white': '0 0 25px -2px rgba(255, 255, 255, 0.15)',
        'hairline': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 8px 32px -4px rgba(0, 0, 0, 0.5)',
        'hairline-hover': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.15), 0 16px 40px -8px rgba(0, 0, 0, 0.7)',
      },
      backgroundImage: {
        'linear-gradient': 'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'silver-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%)',
        'violet-cyan': 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
      }
    },
  },
  plugins: [],
}
