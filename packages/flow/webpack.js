let Compiler = require("./compiler.js");
function webpack(options){
    let compiler = new Compiler(options)
    // 加载所有配置的插件
    for (const plugin of options.plugins) {
        plugin.apply(compiler)
    }
    return compiler
}
module.exports = webpack
