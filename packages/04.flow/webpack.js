let Compiler = require("./compiler.js");
function webpack(options){
    // 1.初始化参数：从配置文件和shell语句中读取与合并参数，得出最终的参数
    let shellOptions= process.argv.slice(2).reduce((config,args)=>{
        let [key,value]=args.split("=")
        config[key.slice(2)]=value
        return config
    },{})
    let finalOptions = {...options,...shellOptions}
    let compiler = new Compiler(finalOptions)
    if(finalOptions.plugins && Array.isArray(finalOptions.plugins)){
        // 加载所有配置的插件
        for (const plugin of options.plugins) {
            plugin.apply(compiler)
        }
    }

    return compiler
}
module.exports = webpack
