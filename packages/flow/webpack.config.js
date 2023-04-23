const path = require("path");
const RunPlugin = require("./plugins/run-plugin.js");
const DonePlugin = require("./plugins/done-plugin.js");
module.exports = {
    mode: "development",
    devtool: false,
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "dist"),
    },
    module: {

    },
    plugins: [
        new RunPlugin(),
        new DonePlugin(),
    ],
    devServer: {}

}
