import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      serif: ["Literata", "serif", "system-ui"],
    },
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
