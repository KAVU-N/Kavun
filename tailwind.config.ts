import type { Config } from "tailwindcss";

export default {
  content: [
    // Root app & components
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // src fallbacks
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--brand-bg)",
        foreground: "var(--foreground)",
        brand: {
          primary: "var(--brand-primary)",
          primaryLight: "var(--brand-primary-light)",
          brown: "var(--brand-brown)",
          accentBg: "var(--brand-accent-bg)",
          border: "var(--brand-border)",
        },
      },
      keyframes: {
        slowpan: {
          '0%': { transform: 'scale(1) translate3d(0, 0, 0)' },
          '50%': { transform: 'scale(1.05) translate3d(0, -1%, 0)' },
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
        'slow-pan': 'slowpan 18s ease-in-out infinite',
        'fade-up': 'fadeup 500ms ease-out both',
        'float-slow': 'float 3.5s ease-in-out infinite',
        'shine': 'shine 900ms ease-in-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
