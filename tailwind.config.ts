import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8F9FF',
        surface: '#FFFFFF',
        'surface-2': '#F3F4FF',
        border: '#E2E4F0',
        'text-primary': '#1A1A2E',
        'text-secondary': '#6B7280',
        accent: '#7C3AED',
        pink: '#EC4899',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #7C3AED, #EC4899)',
      }
    },
  },
  plugins: [],
};
export default config;
