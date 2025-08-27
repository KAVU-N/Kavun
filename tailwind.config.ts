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
    },
  },
  plugins: [],
} satisfies Config;
