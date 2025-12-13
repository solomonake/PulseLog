import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary: Deep Athletic Navy
        navy: {
          DEFAULT: '#0E1A2B',
          50: '#1A2A3F',
          100: '#0E1A2B',
        },
        // Secondary: Performance Green
        green: {
          DEFAULT: '#1DB954',
          50: '#2DD964',
          100: '#1DB954',
        },
        // Warning: Fatigue Yellow
        yellow: {
          DEFAULT: '#F5C451',
          50: '#F9D67A',
          100: '#F5C451',
        },
        // Risk: Risk Red
        red: {
          DEFAULT: '#E5533D',
          50: '#EA6B58',
          100: '#E5533D',
        },
        // Neutrals
        background: '#F7F9FC',
        text: {
          DEFAULT: '#2A2E35',
          muted: '#8A919E',
        },
        border: '#E5E7EB',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

