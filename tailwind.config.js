/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark base palette, matching the "Finance Manager" look.
        ink: {
          900: '#08080c', // page background behind the phone frame
          800: '#0a0a0f', // app background
          700: '#111118', // card background
          600: '#16161f', // raised card / input background
          500: '#1d1d28', // hover / pressed
        },
        accent: {
          DEFAULT: '#5b7fff',
          soft: '#7b99ff',
          dim: '#3a53b8',
        },
      },
      borderRadius: {
        card: '20px',
        pill: '999px',
      },
      boxShadow: {
        glow: '0 8px 30px -8px rgba(91, 127, 255, 0.65)',
        card: '0 10px 30px -18px rgba(0, 0, 0, 0.9)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Inter',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
