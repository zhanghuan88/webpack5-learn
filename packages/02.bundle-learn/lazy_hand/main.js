let modules = {};//未引入模块
let cache = {} //模块缓存对象
//能在浏览器中运行的require函数
function require(moduleId) {
    if (cache[moduleId] !== undefined) {
        return cache[moduleId].exports;
    }
    let module = cache[moduleId] = {
        exports: {}
    };
    modules[moduleId](module, module.exports, require);
    return module.exports;
}

//通过require.m能获取到导入的模块,,再hrm的时候会用到
require.modules = modules
//require.o能判断对象是否有某个属性
require.ownProperty = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
//require.d能给对象添加属性的getter方法
require.defineProperties = function (exports, definition) {
    for (let key in definition) {
        if (require.ownProperty(definition, key) && !require.ownProperty(exports, key)) {
            Object.defineProperty(exports, key, {enumerable: true, get: definition[key]});
        }
    }
}
require.rankEsModule = function (exports) {
    Object.defineProperty(exports, Symbol.toStringTag, {value: "Module"});
    Object.defineProperty(exports, "__esModule", {value: true});
}
//
require.functions = {}
//key带表代码块的名字，0代表已经完成。默认值main表示入口
let installedChunks = {
    "main": 0
};
require.unionFileName = (chunkId) => {
    return chunkId + ".js"
}
require.publicPath = ""
require.load = (url) => {
    let script = document.createElement("script")
    script.src = url
    document.head.appendChild(script)
}
//通过jsonp加载代码块，并放到promises中
require.functions.jsonp = (chunkId, promises) => {
    //先判断是否已经加载过了,如果已经加载过了，就复用老的
    let installedChunkData = require.ownProperty(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
    if (installedChunkData !== 0) {//不等于0表示没有加载完成
        if (installedChunkData) {//不等于0，但是有值，表示正在加载中
            promises.push(installedChunkData[2])//正在加载的时候，将将正在加载promise放到数组中
        } else {
            let promise = new Promise((resolve, reject) => {
                installedChunkData = installedChunks[chunkId] = [resolve, reject]
            })
            installedChunkData[2] = promise;// installedChunkData = [resolve, reject, promise]
            promises.push(promise)
            let url = require.publicPath + require.unionFileName(chunkId)
            require.load(url)
        }

    }
}
//通过jsonp异步加载代码块,chunkId生成规则：将相对于根目录的相对路径生成 ./src/title.js --> src_title_js
require.ensure = (chunkId) => {
    // return Promise.all(Object.keys(require.functions).reduce((promises, key) => {
    //     require.functions[key](chunkId, promises);
    //     return promises;
    // }, []));
    let promises = []
    for (let key in require.functions) {
        let func = require.functions[key]
        func(chunkId, promises)
    }
    return Promise.all(promises)
}

function webpackJsonpCallback(data) {
    let [chunkIds, moreModules] = data;
    for (let moduleId in moreModules) {
        require.modules[moduleId] = moreModules[moduleId]
    }
    for (let i = 0; i < chunkIds.length; i++) {
        let chunkId = chunkIds[i];
        installedChunks[chunkId][0]()//执行resolve,表示加载完成
        installedChunks[chunkId] = 0;
    }
}

let chunkLoadingGlobal = window["webpack5"] = window["webpack5"] = [];
chunkLoadingGlobal.push = webpackJsonpCallback;
let exports = {}
document.addEventListener("click", () => {
    require.ensure("src_title_js").then(require.bind(require, "./src/title.js")).then((title) => {
        console.log(title)
    })
})
