/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        subtle: "rgb(var(--color-subtle) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        primarySoft: "rgb(var(--color-primary-soft) / <alpha-value>)"
      },
      boxShadow: {
        soft: "0 16px 40px rgb(15 23 42 / 0.08)",
        lift: "0 22px 55px rgb(15 23 42 / 0.14)",
        reader: "0 24px 80px rgb(15 23 42 / 0.1)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" }
        }
      },
      animation: {
        "fade-up": "fade-up 420ms ease-out both",
        shimmer: "shimmer 1.8s linear infinite",
        gradient: "gradient 15s ease infinite",
        blob: "blob 7s infinite"
      },
      fontFamily: {
        sans: [
          "var(--font-merriweather)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ]
      }
    }
  },
  plugins: []
};
