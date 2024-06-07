/** @type {import('tailwindcss').Config} */
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
      }
    },
  },
  plugins: [],
}

