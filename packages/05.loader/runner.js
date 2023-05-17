/**
 * 1.loader的分类和顺序
 * pre 前置
 * normal 普通
 * inline 内联
 * post 后置
 */
let path = require('path');
let fs = require('fs');
const {runLoaders} = require("./loader-runner");
let filePath = path.resolve(__dirname, 'src', 'index.js')
//!定义在require方法里面的 inline loader
let request = `inline1-loader!inline2-loader!${filePath}`
//!不同的loader并不loader的类型属性，而是你在使用 的使用了什么样的enforce
let rules = [
    {
        test: /\.js$/,
        use: ['normal1-loader', 'normal2-loader']//普通的loader
    },
    {
        test: /\.js$/,
        enforce: 'post',
        use: ['post1-loader', 'post2-loader']//post的loader 后置
    },
    {
        test: /\.js$/,
        enforce: 'pre',
        use: ['pre1-loader', 'pre2-loader']//pre的loader 前置
    }
]
//顺序是 post(后置)+inline(内联)+normal(普通)+pre(前置)
//parts=['inline1-loader','inline2-loader','src/index.js']
let parts = request.replace(/^-?!+/,"").split('!');
let resource = parts.pop();//'src/index,js!
//解析loader的绝对路径 c: 5.loader\loaders\inline1-loader.js
let resolveLoader = loader => path.resolve(__dirname, 'loaders', loader);
//inlineLoaders=[inline1-loader绝对路径，inline2-loader绝对路径]
let inlineLoaders = parts;
let preLoaders = [], normalLoaders = [], postLoaders = [];
for (let i = 0; i < rules.length; i++) {
    let rule = rules[i];
    if (rule.test.test(resource)) {
        if (rule.enforce === 'pre') {
            preLoaders.push(...rule.use);
        } else if (rule.enforce === 'post') {
            postLoaders.push(...rule.use);
        } else {
            normalLoaders.push(...rule.use);
        }
    }
}

/**
 *  正常 post(后置)+inline(内联)+normal(普通)+pre(前置)
 *  Prefixing with ! will disable all configured normal loaders
 *  post(后置)+inline(内联)+pre(前置)
 *  Prefixing with !! will disable all configured loaders (preLoaders, loaders, postLoaders)
 *  inline(内联)
 *  Prefixing with -! will disable all configured preLoaders and loaders but not postLoaders
 *  post(后置)+inline(内联)
 */
let loaders = [];//表示最终生效的loader
if (request.startsWith('!!')) {
    loaders = [...inlineLoaders];
} else if (request.startsWith('-!')) {
    loaders = [...postLoaders, ...inlineLoaders];
} else if (request.startsWith('!')) {
    loaders = [...postLoaders, ...inlineLoaders, ...preLoaders];
}else {
    loaders = [...postLoaders, ...inlineLoaders, ...normalLoaders, ...preLoaders];
}
loaders= loaders.map(resolveLoader)

runLoaders({
    resource,//要加载和转换的模块
    loaders,//loader的数组
    context:{name:'ZH'},//基础上下文件对象
    readResource:fs.readFile.bind(fs) //读取硬盘文件的方法
},(err,result)=>{
    console.log(err);
    console.log(result);
})
