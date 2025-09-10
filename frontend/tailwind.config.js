/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4da8da',
          DEFAULT: '#2c95cf',
          dark: '#1a7fb6',
        },
        secondary: {
          light: '#5bd999',
          DEFAULT: '#40c282',
          dark: '#35a46d',
        },
        accent: {
          light: '#f8fafc',
          DEFAULT: '#f1f5f9',
          dark: '#e2e8f0',
        },
        white: '#ffffff', 
        gray: {
          800: '#1f2937'
        },
        indigo: {
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        }
      },
    },
  },
  plugins: [],
}

