/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          light: '#F6F2EA',
          dark: '#0E1512'
        },
        surface: {
          light: '#FFFFFF',
          dark: '#17211C'
        },
        border: {
          light: '#E8E2D6',
          dark: '#24332C'
        },
        ink: {
          light: '#16211C',
          dark: '#F1F5F3',
          muted: '#5C6B64'
        },
        primary: {
          DEFAULT: '#123D2F', // Forest Green
          hover: '#0E3025',
          light: '#E9F0EC',
          dark: '#85D4B6'
        },
        tangerine: {
          DEFAULT: '#FF6A2B',
          hover: '#E5581A',
          light: '#FFF0EA'
        },
        lime: {
          DEFAULT: '#D4F05A',
          hover: '#C2DF45',
          dark: '#93AB25'
        },
        coral: {
          DEFAULT: '#FF8A7A', // Expense
          light: '#FFF2F0',
          dark: '#E06554'
        },
        sand: {
          DEFAULT: '#EBDFC7',
          light: '#F8F5EE'
        },
        mint: {
          DEFAULT: '#BFE8D6',
          light: '#EAF7F1'
        }
      },
      fontFamily: {
        heading: ['"Bricolage Grotesque"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif']
      },
      borderRadius: {
        '16': '16px',
        '20': '20px',
        '24': '24px'
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(18, 61, 47, 0.06)',
        card: '0 8px 30px -4px rgba(22, 33, 28, 0.08)',
        modal: '0 20px 40px -6px rgba(18, 61, 47, 0.16)'
      }
    }
  },
  plugins: []
};
