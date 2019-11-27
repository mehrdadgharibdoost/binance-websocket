const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const webpackConfig = {
  target: "web",
  entry: "./client.js",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: {
              minimize: false,
              removeComments: true,
              collapseWhitespace: true,
              interpolate: true
            }
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|server.js|app.js|index.js)/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({ template: "./index.html" })
  ],

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: `[name].bundle.js`,
    chunkFilename: "[name].bundle.js"
  }
};
module.exports = webpackConfig;
