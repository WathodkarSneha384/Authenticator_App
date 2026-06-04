/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:  { DEFAULT: '#1B4F8A', light: '#2D72D2', dark: '#0D2B4E' },
        accent:   '#E8A020',
        success:  '#22C55E',
        danger:   '#EF4444',
        surface:  '#F5F7FA',
      },
    },
  },
  plugins: [],
};
