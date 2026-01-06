const preset = require("@claircoffee/ui/tailwind.preset");

module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [preset],
  theme: {
    extend: {}
  },
  plugins: []
};
