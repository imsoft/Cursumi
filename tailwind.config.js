/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Pink
        'pink-50' : '#e7a9ff',
        'pink-100': '#dc82ff',
        'pink-200': '#d15bff',
        'pink-300': '#c633ff',
        'pink-400': '#bb0cff',
        'pink-500': '#A400E4',
        'pink-600': '#8800bd',
        'pink-700': '#6c0096',
        'pink-800': '#4f006e',
        'pink-900': '#330047',
        
        // Purple
        'purple-50' : '#b998ff',
        'purple-100': '#9f71ff',
        'purple-200': '#844aff',
        'purple-300': '#6a22ff',
        'purple-400': '#5100fa',
        'purple-500': '#4400D3',
        'purple-600': '#3700ac',
        'purple-700': '#2b0085',
        'purple-800': '#1e005d',
        'purple-900': '#110036',

        //Blue
        'blue-50' : '#a87eff',
        'blue-100': '#8d57ff',
        'blue-200': '#7330ff',
        'blue-300': '#5808ff',
        'blue-400': '#4900e0',
        'blue-500': '#3C00B9',
        'blue-600': '#2f0092',
        'blue-700': '#23006b',
        'blue-800': '#160043',
        'blue-900': '#09001c',
      },
    },
  },
  plugins: [],
}
