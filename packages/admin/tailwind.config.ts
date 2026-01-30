import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
        },
        secondary: '#6b7280',
        sidebar: {
          bg: '#04566e',
          text: '#e9ecef',
        },
      },
      spacing: {
        'sidebar': '260px',
        'sidebar-collapsed': '70px',
        'header': '60px',
      },
    },
  },
  plugins: [],
} satisfies Config
