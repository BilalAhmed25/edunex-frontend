/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
  ],
  mode: "jit",
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "15px",
        sm: "15px",
        lg: "15px",
        xl: "0",
        "2xl": "0",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        gray: {
          10: "#E9EAF0",
        },
        primary: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#4F46E5",
          DEFAULT: "#4F46E5",
          600: "#4338CA",
          700: "#3730A3",
          dark: "#4338CA",
          light: "#6366F1",
        },
        secondary: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          DEFAULT: "#10B981",
          600: "#059669",
          700: "#047857",
          dark: "#059669",
          light: "#34D399",
        },
        dark: {
          DEFAULT: "#000000",
          card: "#16181c",
          border: "#2f3336",
        }
      },
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        base: "none",
        card: "none",
        inset: "inset -1px 0px 0px #E9EAF0;",
        inset2: "inset -1px 0px 0px #374151;",
        base2: "none",
        base3: "none",
        deep: "none",
        dropdown: "none",
        testi: "none",
        todo: "none",
        checkbox: "none",
      },
      keyframes: {
        zoom: {
          "0%, 100%": { transform: "scale(0.5)" },
          "50%": { transform: "scale(1)" },
        },
        tada: {
          "0%": { transform: "scale3d(1, 1, 1)" },
          "10%, 20%": {
            transform: "scale3d(1, 1, 0.95) rotate3d(0, 0, 1, -10deg)",
          },
          "30%, 50%, 70%, 90%": {
            transform: "scale3d(1, 1, 1) rotate3d(0, 0, 1, 10deg)",
          },
          "40%, 60%, 80%": {
            transform: "rotate3d(0, 0, 1, -10deg)",
          },
          "100%": { transform: "scale3d(1, 1, 1)" },
        },
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
        "spin-slow": "spin 3s linear infinite",
        zoom: "zoom 1s ease-in-out infinite",
        tada: "tada 1.5s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
