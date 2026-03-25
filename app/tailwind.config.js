/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#38bdf8',
          600: '#0284c7',
        },
      },
    },
  },
  plugins: [],
}

