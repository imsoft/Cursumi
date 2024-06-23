const { fontFamily } = require("tailwindcss/defaultTheme");
import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Pink
        "pink-50": "#e7a9ff",
        "pink-100": "#dc82ff",
        "pink-200": "#d15bff",
        "pink-300": "#c633ff",
        "pink-400": "#bb0cff",
        "pink-500": "#A400E4",
        "pink-600": "#8800bd",
        "pink-700": "#6c0096",
        "pink-800": "#4f006e",
        "pink-900": "#330047",

        // Purple
        "purple-50": "#b998ff",
        "purple-100": "#9f71ff",
        "purple-200": "#844aff",
        "purple-300": "#6a22ff",
        "purple-400": "#5100fa",
        "purple-500": "#4400D3",
        "purple-600": "#3700ac",
        "purple-700": "#2b0085",
        "purple-800": "#1e005d",
        "purple-900": "#110036",

        //Blue
        "blue-50": "#a87eff",
        "blue-100": "#8d57ff",
        "blue-200": "#7330ff",
        "blue-300": "#5808ff",
        "blue-400": "#4900e0",
        "blue-500": "#3C00B9",
        "blue-600": "#2f0092",
        "blue-700": "#23006b",
        "blue-800": "#160043",
        "blue-900": "#09001c",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

export default config;
