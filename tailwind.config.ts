
import type { Config } from "tailwindcss";

export default {
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
      colors: {
        border: "hsl(var(--border))", // Use CSS variable
        input: "hsl(var(--input))",   // Use CSS variable
        ring: "hsl(var(--ring))",     // Use CSS variable
        background: "hsl(var(--background))", // Use CSS variable for default background
        foreground: "hsl(var(--foreground))", // Use CSS variable for default foreground
        primary: {
          DEFAULT: "hsl(var(--primary))", // #8989DE - Kept purple as primary
          foreground: "hsl(var(--primary-foreground))", // #FAFAF8
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))", // Light: #F3F4F6, Dark: #3A3935
          foreground: "hsl(var(--secondary-foreground))", // Light: #1F2937, Dark: #FAFAF8
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))", // Light: #EF4444 (Red), Dark: #D2886F
          foreground: "hsl(var(--destructive-foreground))", // #FAFAF8
        },
        success: { // Added success colors for consistency
          DEFAULT: "#22C55E", // A vibrant green
          foreground: "#FAFAF8",
        },
        warning: { // Adjusted warning for better visibility
          DEFAULT: "#F97316", // A vibrant orange
          foreground: "#FAFAF8",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))", // Light: #9CA3AF, Dark: #605F5B
          foreground: "hsl(var(--muted-foreground))", // Light: #4B5563, Dark: #E6E4DD
        },
        accent: {
          DEFAULT: "hsl(var(--accent))", // #8989DE
          foreground: "hsl(var(--accent-foreground))", // #FAFAF8
        },
        card: { // For shadcn/ui card component
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
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
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
