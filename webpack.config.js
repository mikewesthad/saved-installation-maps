const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  context: path.resolve(__dirname, "src"),
  entry: "./js/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /\.(txt|csv|tsv)$/,
        use: "raw-loader"
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: "file-loader"
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: "file-loader"
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html"
    })
  ],
  target: "electron-renderer",
  devtool: "eval-source-map"
};
