import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          '0': '#060606',
          '1': '#0f0f0f',
          '2': '#161616',
          '3': '#202020',
        },
        lana: {
          text: '#e8e4d9',
          'text-2': '#b8b4ac',
          muted: '#5e5a56',
          border: '#242424',
          'border-2': '#333333',
          gold: '#c9a84c',
          'gold-dim': '#8a7040',
          'gold-bright': '#d4b56a',
          'gold-glow': 'rgba(201, 168, 76, 0.12)',
          green: '#4ade80',
          'green-dim': '#166534',
          red: '#ef4444',
          blue: '#93c5fd',
          purple: '#c084fc',
          amber: '#fbbf24',
          mint: '#6ee7b7',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        scan: 'scan 4s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        scan: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
