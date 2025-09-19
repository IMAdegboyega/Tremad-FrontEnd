// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        myWhite: "#FFFFFF",
        tremadGreen: "",
        tremadLightGreen: "",
        tremadDarkGreen: "",
      },
    },
  },
  plugins: [],
};

export default config;
