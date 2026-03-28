/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#FAF7F2', dark: '#F0EBE1' },
        espresso: { DEFAULT: '#1C0F0A', light: '#2D1A12' },
        brown: { DEFAULT: '#92400E', light: '#B45309', pale: '#FEF3C7' },
        ink: { DEFAULT: '#1C1917', soft: '#44403C', muted: '#78716C' },
        gold: { DEFAULT: '#D97706', light: '#F59E0B', pale: '#FFFBEB' },
        parchment: { DEFAULT: '#F5EFE6', dark: '#EDE4D4' },
        border: { warm: '#E8DFC8', deep: '#C4B49A' },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
