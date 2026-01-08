/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary-start': '#475569',
        'primary-end': '#64748b',
        'accent-cyan': '#22d3ee',
        'accent-emerald': '#10b981',
        'accent-amber': '#f59e0b',
        'accent-red': '#ef4444',
        'bg-dark': '#0f172a',
        'bg-card': '#1e293b',
        'bg-elevated': '#334155',
        'text-primary': '#f1f5f9',
        'text-secondary': '#94a3b8',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sparkle: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(34, 211, 238, 0.6)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(34, 211, 238, 0.4)' },
        },
      },
    },
  },
  plugins: [],
};
