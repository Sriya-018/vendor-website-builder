/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--body-font)', 'Inter', 'sans-serif'],
        heading: ['var(--heading-font)', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        'theme-primary': 'var(--primary)',
        'theme-secondary': 'var(--secondary)',
        'theme-accent': 'var(--accent)',
        'theme-bg': 'var(--background)',
        'theme-surface': 'var(--surface)',
        'theme-text': 'var(--text)',
        'theme-muted': 'var(--muted)',
        'theme-border': 'var(--border)',
      },
      borderRadius: {
        'theme': 'var(--radius)',
      },
      boxShadow: {
        'theme': 'var(--shadow)',
      }
    },
  },
  plugins: [],
}