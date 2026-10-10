/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme Design Tokens
        lavender: {
          50: '#FBFBFF',
          100: '#F5F4FF',
          200: '#F0EFFF', // Primary background
          300: '#E4E2FF',
          400: '#D5D1FF',
        },
        brand: {
          pink: '#E94E9B', // Primary accent pink
          'pink-hover': '#D63F89',
          'pink-light': '#FDF2F8',
          'pink-soft': '#FCE7F3',
          purple: '#37318B', // Dark purple for headings & nav
          'purple-dark': '#29246B',
          'purple-secondary': '#8278E8', // Secondary purple
          'purple-light': '#EEEBFF',
          'blue-light': '#DFF6FC', // Light blue accent
          'blue-soft': '#E6F8FD',
          text: '#292743', // Primary text
          'text-secondary': '#777789', // Secondary text
          border: '#E8E6F0', // Borders
          card: '#FFFFFF', // Main content background
        },
        status: {
          'success-bg': '#E8F8F0',
          'success-text': '#10B981',
          'warning-bg': '#FEF6E7',
          'warning-text': '#D97706',
          'error-bg': '#FDF0F0',
          'error-text': '#EF4444',
          'info-bg': '#DFF6FC',
          'info-text': '#0284C7',
        },
        // Backwards-compatible aliases
        primary: {
          50: '#FDF2F8',
          100: '#FCE7F3',
          500: '#E94E9B',
          600: '#D63F89',
          700: '#BE185D',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(41, 39, 67, 0.05), 0 1px 4px -1px rgba(41, 39, 67, 0.03)',
        'card': '0 4px 20px -4px rgba(55, 49, 139, 0.04), 0 2px 6px -2px rgba(55, 49, 139, 0.02)',
        'elevated': '0 12px 30px -6px rgba(55, 49, 139, 0.08), 0 4px 10px -4px rgba(55, 49, 139, 0.03)',
        'modal': '0 25px 50px -12px rgba(55, 49, 139, 0.18)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      }
    },
  },
  plugins: [],
}
