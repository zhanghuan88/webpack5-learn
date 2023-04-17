const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");

module.exports = {
    mode: "development",
    devtool: false,
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "main.js"
    },
    module: {},
    plugins: [
        new CleanWebpackPlugin({cleanOnceBeforeBuildPatterns: ["**/*"]}),
        new HtmlWebpackPlugin({
            src: "./src/index.html",
            filename: "index.html",
        })
    ],
    devServer: {}

}
