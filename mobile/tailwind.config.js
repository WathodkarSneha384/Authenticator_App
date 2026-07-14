/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0F2C57',
        'primary-light': '#1B4F8A',
        'primary-dark': '#091D3B',
        accent: '#16A9C2',
        'accent-light': '#46C4D8',
        'accent-dark': '#0E8094',
        success: '#22C55E',
        warning: '#EAB308',
        danger: '#EF4444',
        surface: '#F2F7FA',
      },
    },
  },
  plugins: [],
};
