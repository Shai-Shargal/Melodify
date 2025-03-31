/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "lego-red": "#D01012",
        "lego-blue": "#006CB7",
        "lego-yellow": "#FFC300",
        "lego-green": "#00852B",
      },
      boxShadow: {
        lego: "0 4px 0 0 rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [],
};
