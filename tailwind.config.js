/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#000000',
        card: '#ffffff',
        'card-foreground': '#000000',
        popover: '#ffffff',
        'popover-foreground': '#000000',
        primary: '#3455fa',
        'primary-foreground': '#ffffff',
        secondary: '#f5f5f5',
        'secondary-foreground': '#000000',
        muted: '#f5f5f5',
        'muted-foreground': '#787878',
        accent: '#f5f5f5',
        'accent-foreground': '#000000',
        border: '#e8e8e8',
        input: '#e8e8e8',
        ring: '#3455fa',
        'text-primary': '#000000',
        'text-secondary': '#333333',
        'text-tertiary': '#787878',
        'sot-blue': '#3455fa',
        'sot-blue-light': '#5b9cfc',
        'sot-gray-light': '#f5f5f5',
        'sot-border': '#e8e8e8'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Google Sans Flex"', 'sans-serif'],
        serif: ['"Instrument Serif"', 'serif'],
        mono: ['"Fragment Mono"', 'monospace'],
      },
      boxShadow: {
        'sot': 'inset 0px 0px 0px 1px rgb(0,0,0)',
        'sot-light': 'inset 0px 0px 0px 1px #e8e8e8',
        'sot-focus': '0 0 0 2px #ffffff, 0 0 0 4px #3455fa',
      }
    },
  },
  plugins: [],
}
