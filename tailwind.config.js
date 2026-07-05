/** @type {import('tailwindcss').Config} */
module.exports = {
  // Skanujemy HTML główny, strony LP (podfoldery) oraz źródła JS
  content: ['./index.html', './*/index.html', './src/**/*.js'],
  theme: {
    extend: {
      colors: {
        esBlue: '#0b1e39',
        esBlueLight: '#122c54',
        esAccent: '#1bb99a',
        esGray: '#f7f9fc'
      }
    }
  },
  plugins: []
};
