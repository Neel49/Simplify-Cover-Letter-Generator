const path = require("path");


module.exports = {
  mode: "production", // or "development" if you're still working on it
  entry: "./src/contentScript.js",
  output: {
    filename: "contentScript.bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: ""  // explicitly set publicPath to an empty string
  },
  module: {
    rules: [
      {
        test: /\.js$/, 
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  devtool: "source-map",
};
