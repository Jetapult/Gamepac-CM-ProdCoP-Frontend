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
        // SuperAgent Design System Colors
        'sa-primary': '#00554a',
        'sa-accent': '#e4fe05',
        'sa-bg': '#f6f8f6',
        'sa-bg-gray': '#f6f6f6',
        'sa-border': '#e2e9e2',
        'sa-text-gray': '#828282',
      },
      fontFamily: {
        sans: ['SF Pro Display', ...defaultTheme.fontFamily.sans],
        'sf-pro-display': ['SF Pro Display', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'urbanist': ['Urbanist', 'sans-serif'],
     },
     fontWeight: {
      'sf-regular': 400,
      'sf-semibold': 600,
      'sf-bold': 700,
      'sf-black': 900,
    },
    letterSpacing: {
      'tighter-sm': '-0.154px',
      'tighter-md': '-0.198px',
      'tighter-lg': '-0.374px',
    },
    backgroundImage: {
      'login-disabled-btn': 'linear-gradient(333deg, rgba(17, 168, 95, 0.40) 13.46%, rgba(31, 103, 68, 0.40) 103.63%)',
      'login-enabled-btn': 'linear-gradient(333deg, #11A85F 13.46%, #1F6744 103.63%)',
    },
    },
  },
  plugins: [],
}

