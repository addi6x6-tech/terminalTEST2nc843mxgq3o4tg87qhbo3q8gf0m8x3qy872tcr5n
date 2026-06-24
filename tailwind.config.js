/** @type {import('tailwindcss').Config} */
module.exports = {
  // Skanujemy HTML oraz źródła JS (status formularza dokłada klasy dynamicznie)
  content: ['./index.html', './src/**/*.js'],
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
