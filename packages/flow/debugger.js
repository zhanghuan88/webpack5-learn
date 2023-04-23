let webpack =require("./webpack");
const options = require("./webpack.config.js");
let compiler = webpack(options)
compiler.run((err, stats) => {
    console.log(err)
    console.log(stats.toJson({
        entry:true ,//入口信息
        modules:true,//模块信息
        chunks:true,//代码块信息
        assets:true,//资源信息
        files:true,//生成文件信息

    }))
})
