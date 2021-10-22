module.exports = {
  plugins: [
    require("tailwindcss")("tailwind.config.cjs"),
    require("autoprefixer"),
    require("postcss-flexbugs-fixes"),
    require("postcss-preset-env")({ autoprefixer: { flexbox: "no-2009" }, stage: 3 }),
  ],
};
