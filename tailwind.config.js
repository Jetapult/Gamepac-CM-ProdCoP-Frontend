/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')

export default {
  content: [
    "./index.html",
    
    
    "./src/**/*.{js,ts,jsx,tsx}",
    ],
  theme: {
    extend: {
      colors: {
        rating5: '#62b47b',
        rating4: '#bfd17e',
        rating3: '#fcd66b',
        rating2: '#ffb46f',
        rating1: '#fd7779',
      },
      fontFamily: {
        sans: ['SF Pro Display', ...defaultTheme.fontFamily.sans],
        'sf-pro-display': ['SF Pro Display', 'sans-serif'],
     },
     fontWeight: {
      'sf-regular': 400,
      'sf-semibold': 600,
      'sf-bold': 700,
      'sf-black': 900,
    },
    },
  },
  plugins: [],
}

