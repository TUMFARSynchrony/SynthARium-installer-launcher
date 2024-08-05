const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./src/renderer/**/*.{js,jsx,ts,tsx,ejs}'],
  theme: {
    extend: {
        fontFamily: {
            palanquin: ['Palanquin', 'sans-serif'],
            montserrat: ['Montserrat', 'sans-serif'],
          },
          colors: {
            'primary': "#ECEEFF",
            "coral-red": "#FF6452",
            "slate-gray": "#6D6D6D",
            "pale-blue": "#F5F6FF",
            "white-400": "rgba(255, 255, 255, 0.80)"
          },
          boxShadow: {
            '3xl': '0 10px 40px rgba(0, 0, 0, 0.1)'
          },
          backgroundImage: {
            'hero': "url('assets/images/collection-background.svg')",
            'card': "url('assets/images/thumbnail-background.svg')",
          },
          screens: {
            "wide": "1440px"
          }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};