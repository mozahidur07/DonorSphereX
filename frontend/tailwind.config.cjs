/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Make sure future and experimental features are enabled for Tailwind CSS v4
  future: {
    hoverOnlyWhenSupported: true,
  }
}
