/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary brand — warm saffron/amber
        saffron: {
          50:  '#fff8ed',
          100: '#ffefd3',
          200: '#ffdaa6',
          300: '#ffc06e',
          400: '#ff9b3a',
          500: '#f97d17',
          600: '#ea610d',
          700: '#c24b0d',
          800: '#9a3b12',
          900: '#7c3212',
        },
        // Secondary — calm teal
        teal: {
          50:  '#effcf6',
          100: '#d8f8ea',
          200: '#b4f0d5',
          300: '#7de3b8',
          400: '#45ce96',
          500: '#1eb37c',
          600: '#119163',
          700: '#0f7451',
          800: '#0e5c41',
          900: '#0d4c36',
        },
        // Severity palette (accessible)
        severity: {
          mild:     '#f0ab3f',   // amber
          moderate: '#e06c2e',   // orange
          severe:   '#c0392b',   // deep red
          mildDark:     '#fbbf24',
          moderateDark: '#fb923c',
          severeDark:   '#f87171',
        },
        // Deficiency type colours
        deficiency: {
          iron:     '#e57373',
          vitamin_a:'#ffb74d',
          zinc:     '#81c784',
          iodine:   '#64b5f6',
          folate:   '#ba68c8',
        },
        // Neutral warm
        warm: {
          50:  '#fafaf8',
          100: '#f5f5f0',
          200: '#e8e8e0',
          300: '#d4d4c8',
          400: '#b0b098',
          500: '#8c8c78',
          600: '#706f5c',
          700: '#5a594a',
          800: '#4a4938',
          900: '#3c3b2c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 2px 12px 0 rgba(0,0,0,0.07)',
        'card-hover': '0 8px 28px 0 rgba(0,0,0,0.12)',
        'card-dark': '0 2px 12px 0 rgba(0,0,0,0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        pulseSoft: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.7 } },
      }
    },
  },
  plugins: [],
}
