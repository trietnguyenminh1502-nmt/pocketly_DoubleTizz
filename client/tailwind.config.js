/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        auth: 'rgb(var(--color-auth-text) / <alpha-value>)',
        'auth-ink': 'rgb(var(--color-auth-ink) / <alpha-value>)',
        'auth-warm': 'rgb(var(--color-auth-warm) / <alpha-value>)',
        'auth-accent': 'rgb(var(--color-auth-accent) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        'success-bg': 'rgb(var(--color-success-bg) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        'warning-bg': 'rgb(var(--color-warning-bg) / <alpha-value>)',
        'warning-hover': 'rgb(var(--color-warning-hover) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        'danger-soft': 'rgb(var(--color-danger-soft) / <alpha-value>)',
        info: 'rgb(var(--color-info) / <alpha-value>)',
        'info-bg': 'rgb(var(--color-info-bg) / <alpha-value>)',
        'chart-border': 'rgb(var(--color-chart-border) / <alpha-value>)',
        'chart-primary': 'rgb(var(--color-chart-primary) / <alpha-value>)',
        'chart-expense': 'rgb(var(--color-chart-expense) / <alpha-value>)',
        'chart-secondary': 'rgb(var(--color-chart-secondary) / <alpha-value>)',
        'focus-ink': 'rgb(var(--color-focus-ink) / <alpha-value>)',
        'status-neutral': 'rgb(var(--color-status-neutral) / <alpha-value>)',
        'status-neutral-bg': 'rgb(var(--color-status-neutral-bg) / <alpha-value>)',
        brand: 'rgb(var(--color-primary) / <alpha-value>)',
        bg: {
          light: 'rgb(var(--color-background) / <alpha-value>)',
          dark: 'rgb(var(--color-background) / <alpha-value>)'
        },
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          light: 'rgb(var(--color-surface) / <alpha-value>)',
          dark: 'rgb(var(--color-surface) / <alpha-value>)'
        },
        border: {
          DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
          light: 'rgb(var(--color-border) / <alpha-value>)',
          dark: 'rgb(var(--color-border) / <alpha-value>)'
        },
        ink: {
          light: 'rgb(var(--color-ink-light) / <alpha-value>)',
          dark: 'rgb(var(--color-ink-dark) / <alpha-value>)',
          muted: 'rgb(var(--color-text-secondary) / <alpha-value>)'
        },
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          hover: 'rgb(var(--color-primary-hover) / <alpha-value>)',
          light: 'rgb(var(--color-primary-light) / <alpha-value>)',
          dark: 'rgb(var(--color-primary-dark) / <alpha-value>)'
        },
        tangerine: {
          DEFAULT: 'rgb(var(--color-tangerine) / <alpha-value>)',
          hover: 'rgb(var(--color-tangerine-hover) / <alpha-value>)',
          light: 'rgb(var(--color-tangerine-light) / <alpha-value>)'
        },
        lime: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          hover: 'rgb(var(--color-accent-hover) / <alpha-value>)',
          dark: 'rgb(var(--color-lime-dark) / <alpha-value>)'
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          hover: 'rgb(var(--color-accent-hover) / <alpha-value>)'
        },
        coral: {
          DEFAULT: 'rgb(var(--color-coral) / <alpha-value>)',
          light: 'rgb(var(--color-coral-light) / <alpha-value>)',
          dark: 'rgb(var(--color-coral-dark) / <alpha-value>)'
        },
        sand: {
          DEFAULT: 'rgb(var(--color-sand) / <alpha-value>)',
          light: 'rgb(var(--color-sand-light) / <alpha-value>)'
        },
        mint: {
          DEFAULT: 'rgb(var(--color-mint) / <alpha-value>)',
          light: 'rgb(var(--color-mint-light) / <alpha-value>)'
        }
      },
      textColor: {
        primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)'
      },
      borderRadius: {
        card: '16px',
        control: '12px',
        '16': '16px',
        '20': '20px',
        '24': '24px'
      },
      boxShadow: {
        'token-card': 'var(--shadow-soft)',
        'token-overlay': 'var(--shadow-overlay)',
        'auth-button': 'var(--shadow-auth-button)',
        'auth-button-hover': 'var(--shadow-auth-button-hover)',
        'auth-focus': '0 0 0 3px rgb(var(--color-auth-accent) / 0.4)',
        soft: 'var(--shadow-soft)',
        card: 'var(--shadow-card)',
        modal: 'var(--shadow-overlay)'
      },
      fontSize: {
        12: '12px',
        14: '14px',
        16: '16px',
        20: '20px',
        28: '28px',
        36: '36px'
      },
      fontFamily: {
        heading: ['"Bricolage Grotesque"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', '"DM Sans"', 'sans-serif']
      }
    }
  },
  plugins: []
};
