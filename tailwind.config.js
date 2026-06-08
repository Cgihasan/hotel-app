/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff8ff',
          100: '#dbeefe',
          200: '#bee0fd',
          300: '#92cdfb',
          400: '#5fb1f8',
          500: '#3a91f3',
          600: '#2474e8',
          700: '#1c5fd4',
          800: '#1d4eac',
          900: '#1d4488',
          950: '#162c54',
        },
        teal: {
          50: '#effefb',
          100: '#c7fff3',
          200: '#90ffe9',
          300: '#52f5dd',
          400: '#1fe1cb',
          500: '#06c4b1',
          600: '#039d91',
          700: '#077d75',
          800: '#0c625f',
          900: '#0d514f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -4px rgba(15, 23, 42, 0.08)',
        glow: '0 0 0 1px rgba(36, 116, 232, 0.12), 0 8px 24px -6px rgba(36, 116, 232, 0.25)',
      },
      backgroundImage: {
        'grid-slate': "linear-gradient(to right, rgb(241 245 249 / 0.6) 1px, transparent 1px), linear-gradient(to bottom, rgb(241 245 249 / 0.6) 1px, transparent 1px)",
        'mesh-blue': "radial-gradient(at 20% 10%, rgba(36,116,232,0.18) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(6,196,177,0.18) 0px, transparent 50%), radial-gradient(at 80% 100%, rgba(36,116,232,0.12) 0px, transparent 50%)",
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        shimmer: 'shimmer 1.6s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
