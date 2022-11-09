/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './src/**/*.tsx',
    './public/index.html',
    './node_modules/@bctc/components/dist/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        THEME: colors.sky,
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
