import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: { brand: { 50: "#eef4ff", 100: "#d9e7ff", 500: "#2470e0", 600: "#1259c3", 700: "#0b4aa5", 900: "#0a2f66" }, leaf: { 500: "#22a355", 600: "#178a44", 700: "#116b35" } } } },
  plugins: [],
} satisfies Config;
