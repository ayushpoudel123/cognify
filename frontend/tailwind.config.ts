import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // keep class-based but default to light
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1877F2', // Facebook blue
          hover: '#166FE5',
          light: '#E7F3FF',
          dark: '#0C5AB4',
        },
        secondary: {
          DEFAULT: '#42B72A', // Facebook green
          hover: '#36A420',
          light: '#E6F4E2',
        },
        background: '#F0F2F5',   // Facebook page background
        surface: {
          DEFAULT: '#FFFFFF',    // White card background
          hover: '#F2F2F2',
          border: '#E4E6EB',     // Subtle light border
          muted: '#F7F8FA',
        },
        text: {
          primary: '#050505',    // Near-black
          secondary: '#65676B',  // Medium gray
          muted: '#8A8D91',      // Light gray
        },
        accent: {
          pink: '#E4006C',
          emerald: '#00A854',
          amber: '#F5A623',
          red: '#FA3E3E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.10)',
        'float': '0 8px 24px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
    },
  },
  plugins: [],
};
export default config;
