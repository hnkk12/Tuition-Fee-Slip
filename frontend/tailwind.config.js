/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          light: '#FFF9F5',
          DEFAULT: '#FFF8F3',
          dark: '#FDF6F0',
        },
        border: {
          soft: '#FDE8E0',
        },
        coral: {
          light: '#FFEFEA',
          peach: '#FA8072',
          DEFAULT: '#E85A71',
          dark: '#D94668',
        },
        burgundy: {
          light: '#4A2030',
          DEFAULT: '#2D1B2D',
          dark: '#1E121E',
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        serif: ['Montserrat', 'sans-serif'],
        cursive: ['Montserrat', 'sans-serif'],
        mono: ['Montserrat', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
