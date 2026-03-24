/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        accent: '#16a34a',
        surface: '#f8fafc',
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(37, 99, 235, 0.35)',
      },
      keyframes: {
        pulseShadow: {
          '0%, 100%': { boxShadow: '0 12px 24px -12px rgba(37, 99, 235, 0.20)' },
          '50%': { boxShadow: '0 18px 30px -12px rgba(37, 99, 235, 0.35)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-shadow': 'pulseShadow 2.8s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.35s ease-out',
      },
    },
  },
  plugins: [],
}
