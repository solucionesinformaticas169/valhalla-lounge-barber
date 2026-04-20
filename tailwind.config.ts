import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
        serif: ["var(--font-cinzel)", "serif"]
      },
      colors: {
        night: "#05070d",
        ember: "#1b120d",
        bronze: "#8a5a2d",
        gold: "#d4af62",
        steel: "#a7afc5",
        fjord: "#0e1a2d"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(212, 175, 98, 0.3), 0 20px 60px rgba(0, 0, 0, 0.45)"
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at top, rgba(212, 175, 98, 0.22), transparent 42%), radial-gradient(circle at 20% 20%, rgba(30, 58, 95, 0.35), transparent 35%)"
      }
    }
  },
  plugins: []
};

export default config;
