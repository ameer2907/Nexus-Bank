/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        void: '#030712',
        surface: '#0A0F1E',
        panel: '#0F172A',
        border: '#1E293B',
        'border-bright': '#2D3A52',
        electric: '#0066FF',
        'electric-light': '#3B82F6',
        cyan: '#00D4FF',
        emerald: '#10B981',
        amber: '#F59E0B',
        rose: '#F43F5E',
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(0, 102, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 102, 255, 0.03) 1px, transparent 1px)`,
        'glow-electric': 'radial-gradient(ellipse at center, rgba(0, 102, 255, 0.15) 0%, transparent 70%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      boxShadow: {
        'electric': '0 0 30px rgba(0, 102, 255, 0.3)',
        'electric-sm': '0 0 15px rgba(0, 102, 255, 0.2)',
        'glow': '0 0 60px rgba(0, 102, 255, 0.2)',
        'panel': '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
}
