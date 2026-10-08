/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      colors: {
        obs: {
          bg: '#0a0a0a',
          card: '#111111',
          healthy: '#10B981',
          warning: '#F59E0B',
          critical: '#EF4444',
          info: '#3B82F6',
          accent: '#8B5CF6',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-red': 'glowRed 1.5s ease-in-out infinite alternate',
        'glow-green': 'glowGreen 2s ease-in-out infinite alternate',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.5s ease-out',
        'spin-slow': 'spin 8s linear infinite',
        'flash': 'flash 0.3s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'counter-tick': 'counterTick 0.15s ease-out',
      },
      keyframes: {
        glowRed: {
          '0%': { boxShadow: '0 0 5px rgba(239, 68, 68, 0.3), 0 0 20px rgba(239, 68, 68, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(239, 68, 68, 0.6), 0 0 60px rgba(239, 68, 68, 0.3), 0 0 100px rgba(239, 68, 68, 0.1)' },
        },
        glowGreen: {
          '0%': { boxShadow: '0 0 5px rgba(16, 185, 129, 0.2)' },
          '100%': { boxShadow: '0 0 15px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.1)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flash: {
          '0%': { opacity: '0.8' },
          '50%': { opacity: '0.4' },
          '100%': { opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        counterTick: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
