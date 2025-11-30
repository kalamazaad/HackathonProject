/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f0f7f4',
          100: '#dcebe3',
          200: '#bdd7c8',
          300: '#94b9a5',
          400: '#6b9f78',
          500: '#4a7c59',
          600: '#3a6347',
          700: '#2f503a',
          800: '#284130',
          900: '#22362a',
        },
      },
    },
  },
}

