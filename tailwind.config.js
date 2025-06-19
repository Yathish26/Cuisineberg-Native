/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",       // If you're using Expo Router, app/ is common
    "./components/**/*.{js,jsx,ts,tsx}", // If you have a components folder
    // Add any other folders where you use Tailwind classes
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}