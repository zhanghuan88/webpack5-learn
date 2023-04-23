const path = require("path");

module.exports = {
    mode: "development",
    devtool: false,
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "dist"),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        plugins: [
                            [
                                path.resolve(__dirname, "plugins/babel-plugin-import.js"),
                                { //配置项
                                    library: "lodash",//只针对lodash库进行处理
                                }
                            ]
                        ]
                    }
                }
            }
        ]
    },
    plugins: [],
    devServer: {}

}
