const path = require("path");
const RunPlugin = require("./plugins/run-plugin.js");
const DonePlugin = require("./plugins/done-plugin.js");
module.exports = {
    mode: "development",
    devtool: false,
    entry: {
        entry1: "./src/entry1.js",
        entry2: "./src/entry2.js",
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json']
    },
    output: {
        path: path.resolve(__dirname, "dist"),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    path.resolve(__dirname, "loaders", "logger1-loader.js"),
                    path.resolve(__dirname, "loaders", "logger2-loader.js")
                ]
            }
        ]
    },
    plugins: [
        new RunPlugin(),
        new DonePlugin(),
    ],
    devServer: {}

}
