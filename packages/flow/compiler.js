let {SyncHook} = require("tapable")
let path = require("path")
const {toUnixPath} = require('./utils')
const fs = require('fs')
let rootPath = process.cwd()
let parser = require("@babel/parser")
let traverse = require("@babel/traverse").default
let t = require("@babel/types")
let generator = require("@babel/generator").default

class Compiler {
    constructor(options) {
        this.options = options
        this.hooks = {
            run: new SyncHook(),//开始编译
            emit: new SyncHook(),//写入文件系统
            done: new SyncHook(),//完成编译
        }
        this.entries = new Set()//所有的入口模块
        this.modules = new Set()//所有的模块
        this.chunks = new Set()//所有的代码块
        this.assets = new Set()//本次要产出的文件
        this.files = new Set()//本次编译所有产出的文件
    }

    run(callback) {
        this.hooks.run.call()
        // 1.读取入口文件内容
        let entry = {}
        if (typeof this.options.entry === "string") {
            entry.main = this.options.entry
        } else {
            entry = this.options.entry
        }
        //从入口文件触发，调用所有配置的Loader对模块进行编译
        for (let entryName in entry) {
            let entryPath = toUnixPath(path.join(rootPath, entry[entryName]))
            let entryModule = this.buildModule(entryName, entryPath)
            this.entries.add(entryModule)
        }

    }

    buildModule(entryName, modulePath) {
        //1.读取出来此模块的内容
        let originalSourceCode = fs.readFileSync(modulePath, "utf8")
        let targetSourceCode = originalSourceCode
        //2.调用所有配置的Loader对模块进行编译
        let rules = this.options.module.rules;
        let loaders = [];
        for (let i = 0; i < rules.length; i++) {
            if (rules[i].test.test(modulePath)) {
                loaders.push(...rules[i].use)
            }
        }
        for (let i = loaders.length - 1; i >= 0; i--) {
            targetSourceCode = require(loaders[i])(targetSourceCode)
        }
        //在找出该模块依赖的模块，在递归本步骤直到所有的入口依赖的文件经过了本步骤的处理
        let moduleId = "./" + path.posix.relative(rootPath, modulePath)
        let module = {id: moduleId, dependencies: [], name: entryName}
        console.log("==============")
        console.log(targetSourceCode)
        console.log("==============")
    }
}

module.exports = Compiler
