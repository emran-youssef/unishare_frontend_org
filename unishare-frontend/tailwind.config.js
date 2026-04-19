/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ─── ZUJ Green primary palette ─────────────────────────────────
        'primary':                    '#2D7A3A',
        'on-primary':                 '#ffffff',
        'primary-container':          '#4CAF5A',
        'on-primary-container':       '#0a3d14',
        'primary-fixed':              '#c8eecf',
        'primary-fixed-dim':          '#9ADA9D',
        'on-primary-fixed':           '#002109',
        'on-primary-fixed-variant':   '#1f5e2a',

        'secondary':                  '#4453bf',
        'on-secondary':               '#ffffff',
        'secondary-container':        '#808fff',
        'on-secondary-container':     '#0a1e91',
        'secondary-fixed':            '#dfe0ff',
        'secondary-fixed-dim':        '#bcc2ff',
        'on-secondary-fixed':         '#000c61',
        'on-secondary-fixed-variant': '#2a3aa6',

        'tertiary':                   '#006c4b',
        'on-tertiary':                '#ffffff',
        'tertiary-container':         '#44b185',
        'on-tertiary-container':      '#003e2a',
        'tertiary-fixed':             '#8cf7c6',
        'tertiary-fixed-dim':         '#70daab',
        'on-tertiary-fixed':          '#002114',
        'on-tertiary-fixed-variant':  '#005138',

        'error':                      '#ba1a1a',
        'on-error':                   '#ffffff',
        'error-container':            '#ffdad6',
        'on-error-container':         '#93000a',

        'surface':                    '#f6faf6',
        'surface-dim':                '#d9dfd9',
        'surface-bright':             '#f6faf6',
        'surface-container-lowest':   '#ffffff',
        'surface-container-low':      '#f0f5f0',
        'surface-container':          '#eaefea',
        'surface-container-high':     '#e4e9e4',
        'surface-container-highest':  '#dfe4df',
        'surface-variant':            '#dfe4df',
        'surface-tint':               '#2D7A3A',

        'on-surface':                 '#181d18',
        'on-surface-variant':         '#3d4d3e',
        'on-background':              '#181d18',
        'background':                 '#f6faf6',

        'outline':                    '#6c7d6d',
        'outline-variant':            '#bccabd',

        'inverse-surface':            '#2d322d',
        'inverse-on-surface':         '#ecf2ec',
        'inverse-primary':            '#9ADA9D',
      },
      fontFamily: {
        headline: ['"Space Grotesk"', 'sans-serif'],
        body:     ['"Inter"',         'sans-serif'],
        label:    ['"Inter"',         'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg:      '0.5rem',
        xl:      '0.75rem',
        '2xl':   '1rem',
        full:    '9999px',
      },
      boxShadow: {
        'card':    '0 8px 30px rgba(45, 122, 58, 0.06)',
        'card-lg': '0 16px 50px rgba(45, 122, 58, 0.10)',
        'primary': '0 8px 32px rgba(45, 122, 58, 0.30)',
      },
    },
  },
  plugins: [],
};
