import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: { brand: { 100: "#d9fbe8", 600: "#0d7a4f", 700: "#0b6140" } } } },
  plugins: [],
} satisfies Config;
