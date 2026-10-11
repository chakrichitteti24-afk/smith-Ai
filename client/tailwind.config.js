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
          DEFAULT: '#ffffff',
          hover: '#e4e4e7',
          glow: '#ffffff',
          soft: 'rgba(255, 255, 255, 0.08)',
        },
        secondary: {
          DEFAULT: '#a1a1aa',
          hover: '#d4d4d8',
          glow: '#ffffff',
          soft: 'rgba(255, 255, 255, 0.04)',
        },
        violet: {
          DEFAULT: '#d4d4d8',
          hover: '#e4e4e7',
          glow: '#ffffff',
          soft: 'rgba(255, 255, 255, 0.06)',
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
        'glow-violet': '0 0 25px -2px rgba(255, 255, 255, 0.12)',
        'glow-cyan': '0 0 25px -2px rgba(255, 255, 255, 0.12)',
        'glow-emerald': '0 0 25px -2px rgba(255, 255, 255, 0.12)',
        'glow-white': '0 0 25px -2px rgba(255, 255, 255, 0.15)',
        'hairline': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 8px 32px -4px rgba(0, 0, 0, 0.5)',
        'hairline-hover': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.15), 0 16px 40px -8px rgba(0, 0, 0, 0.7)',
      },
      backgroundImage: {
        'linear-gradient': 'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'silver-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%)',
        'violet-cyan': 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      gridTemplateColumns: {
        '15': 'repeat(15, minmax(0, 1fr))',
      },
      scale: {
        '102': '1.02',
      },
    },
  },
  plugins: [],
}
