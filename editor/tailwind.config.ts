import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#fe2c55',
      },
    },
  },
  plugins: [],
} satisfies Config
