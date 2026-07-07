/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ghl: {
          blue: '#1A365D',      // Deep premium blue
          lightBlue: '#2B6CB0', // Accent blue
          sidebar: '#111827',   // Slate-900
          surface: '#F9FAFB',   // Gray-50
          border: '#E5E7EB',    // Gray-200
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
