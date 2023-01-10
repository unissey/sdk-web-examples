const path = require("path");

const outDir = path.resolve(__dirname, "public");

module.exports = {
  entry: {
    recorder: "./src/video-recorder.js",
  },
  output: {
    filename: "[name].bundle.js",
    path: outDir,
  },
  devServer: {
    static: {
      directory: outDir,
    },
    compress: true,
    port: 5000,
  },
};
