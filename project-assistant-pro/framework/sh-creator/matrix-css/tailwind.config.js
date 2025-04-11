/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        matrix: {
          bg: 'var(--m-bg)',
          text: 'var(--m-text)',
          'text-dim': 'var(--m-text-dim)',
          'text-bright': 'var(--m-text-bright)',
          'text-white': 'var(--m-text-white)',
          glow: 'var(--m-glow)',
          panel: 'var(--m-panel)',
          border: 'var(--m-border)',
          overlay: 'var(--m-overlay)',
          primary: 'var(--m-primary)',
          secondary: 'var(--m-secondary)',
          info: 'var(--m-info)',
          success: 'var(--m-success)',
          warning: 'var(--m-warning)',
          danger: 'var(--m-danger)',
          light: 'var(--m-light)',
          dark: 'var(--m-dark)',
        },
      },
      fontFamily: {
        matrix: 'var(--m-font-main)',
        'matrix-alt': 'var(--m-font-alt)',
        'matrix-hacker': 'var(--m-font-hacker)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s infinite',
        scanline: 'scanline 10s linear infinite',
        noise: 'noise 1s steps(2) infinite',
        flicker: 'flicker 3s infinite',
        'cursor-blink': 'cursor-blink 1s step-end infinite',
        'neuron-pulse': 'neuron-pulse 2s infinite',
        'connection-pulse': 'connection-pulse 2s infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { textShadow: '0 0 5px var(--m-glow)' },
          '50%': { textShadow: '0 0 20px var(--m-glow), 0 0 30px var(--m-glow)' },
        },
        scanline: {
          '0%': { top: '0' },
          '100%': { top: '100%' },
        },
        noise: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(-10%, -10%)' },
        },
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': { opacity: '1' },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': { opacity: '0' },
        },
        'cursor-blink': {
          '0%, 100%': { opacity: '0' },
          '50%': { opacity: '1' },
        },
        'neuron-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px var(--m-glow)' },
          '50%': { boxShadow: '0 0 15px var(--m-glow), 0 0 20px var(--m-glow)' },
        },
        'connection-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

