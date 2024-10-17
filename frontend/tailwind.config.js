/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'coinstats-blue': '#0052FE',
        'coinstats-dark': '#1C1C1C',
        'coinstats-gray': '#808080',
        'coinstats-light-gray': '#F8F8F8',
      },
      fontFamily: {
        'coinstats': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

