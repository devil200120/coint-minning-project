/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f59e0b',
          dark: '#d97706',
          light: '#fbbf24',
        },
        secondary: {
          DEFAULT: '#10b981',
          dark: '#059669',
        },
        sidebar: '#1e293b',
      },
    },
  },
  plugins: [],
}

