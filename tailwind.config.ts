import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F9F5EE',
        ink:   '#1C1A17',
        olive: {
          DEFAULT: '#5C6B3A',
          dark:    '#4a5730',
          light:   '#7a8f4e',
        },
        rust: {
          DEFAULT: '#C4612A',
          dark:    '#a84f22',
          light:   '#d97748',
        },
      },
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
