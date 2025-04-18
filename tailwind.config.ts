import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx,css}",
    "!./src/services/**/*.ts"
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#FF7722",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#34D399",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#FB923C",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        hindi: ["Mukta", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        "scale-up": {
          "0%": {
            transform: "scale(0.95)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "scale-up": "scale-up 0.5s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
