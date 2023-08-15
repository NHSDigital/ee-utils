module.exports = {
  env: {
    test: {
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              node: "current",
            },
          },
        ],
      ],
      plugins: [
        "@babel/plugin-transform-modules-commonjs",
        "babel-plugin-transform-import-meta",
      ],
    },
  },
};
