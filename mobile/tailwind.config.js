/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette derived from the datavsnus globe logo.
        primary:  { DEFAULT: '#0F2C57', light: '#1B4F8A', dark: '#091D3B' }, // deep navy
        accent:   { DEFAULT: '#16A9C2', light: '#46C4D8', dark: '#0E8094' }, // teal / cyan
        success:  '#22C55E',
        danger:   '#EF4444',
        surface:  '#F2F7FA',
      },
    },
  },
  plugins: [],
};
