/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // TropelCare dark terminal palette
        void: '#080C10',
        panel: '#0E1520',
        surface: '#141C2B',
        border: '#1E2D42',
        accent: '#00E5FF',
        warn: '#FFB800',
        danger: '#FF3D5A',
        stable: '#00E676',
        muted: '#4A6180',
        text: {
          primary: '#E2EAF4',
          secondary: '#8AA5C2',
          dim: '#4A6180',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
}
