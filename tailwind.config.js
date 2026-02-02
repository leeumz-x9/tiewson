// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        lanna: {
          blue: '#696FC7',
          gold: '#F59E0B',
          green: '#10B981'
        }
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite'
      },
      fontFamily: {
        'thai': ['Sarabun', 'sans-serif'],
        'english': ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}