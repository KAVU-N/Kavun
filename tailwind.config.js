/** @type {import('tailwindcss').Config} */
module.exports = {
  safelist: [
    'animate-slow-pan',
    'animate-fade-up',
    'animate-float-slow',
    'animate-shine',
  ],
  content: [
    // Root app & components
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    // src fallbacks
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        slowpan: {
          '0%': { transform: 'scale(1) translate3d(0, 0, 0)' },
          '50%': { transform: 'scale(1.05) translate3d(0, -2%, 0)' },
          '100%': { transform: 'scale(1) translate3d(0, 0, 0)' },
        },
        fadeup: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        shine: {
          '0%': { transform: 'translateX(-120%) skewX(-12deg)' },
          '100%': { transform: 'translateX(120%) skewX(-12deg)' },
        },
      },
      animation: {
        'slow-pan': 'slowpan 20s ease-in-out infinite',
        'fade-up': 'fadeup 500ms ease-out both',
        'float-slow': 'float 3.5s ease-in-out infinite',
        'shine': 'shine 900ms ease-in-out',
      },
    },
  },
  plugins: [],
}

