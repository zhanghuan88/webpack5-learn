let {SyncHook} = require("tapable")
let path = require("path")
const {toUnixPath} = require('./utils')
const fs = require('fs')
let rootPath = toUnixPath(process.cwd())
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
        this.assets = {}//本次要产出的文件
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
            // this.modules.add(entryModule)
            //根据入口和模块之间的依赖关系，组装 成一个个包含多个模块的Chunk
            let chunk = {
                name: entryName,
                entryModule,
                modules: Array.from(this.modules).filter(module => module.name === entryName)
            }
            this.chunks.add(chunk)
        }
        //再把每个Chunk转成一个单独的文件加入到输出列表中
        let output = this.options.output
        this.chunks.forEach(chunk => {
            let filename = output.filename.replace("[name]", chunk.name)
            this.assets[filename] = getSource(chunk)
        })
        this.files = Object.keys(this.assets)
        for (let filename in this.assets) {
            let filePath = path.join(output.path, filename)
            fs.writeFileSync(filePath, this.assets[filename])
        }
        this.hooks.done.call()
        callback(null, {
            toJson: () => ({
                entries: this.entries,
                chunks: this.chunks,
                modules: this.modules,
                files: this.files,
                assets: this.assets
            })
        })

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
        let ast = parser.parse(targetSourceCode, {sourceType: "module"})
        traverse(ast, {
            CallExpression: ({node}) => {
                if (node.callee.name === 'require') {
                    //要引入模块的相对路径
                    let moduleName = node.arguments[0].value
                    let dirName = path.posix.dirname(modulePath)
                    let depModulePath = path.posix.join(dirName, moduleName)
                    let extensions = this.options.resolve.extensions
                    depModulePath = tryExtensions(depModulePath, extensions, moduleName, dirName)
                    let depModuleId = "./" + path.posix.relative(rootPath, depModulePath)
                    node.arguments = [t.stringLiteral(depModuleId)]
                    let alreadyModuleIds = Array.from(this.modules).map(module => module.id)
                    if (!alreadyModuleIds.includes(depModuleId)) {
                        module.dependencies.push(depModulePath)
                    }
                }
            }
        })
        let code = generator(ast).code
        module._source = code
        module.dependencies.forEach(dependency => {
            let depModule = this.buildModule(entryName, dependency)
            this.modules.add(depModule)
        })
        return module
    }
}

function getSource(chunk) {
    return `
        (() => {
    var __webpack_modules__ = ({
       ${
        chunk.modules.map(module => `
             "${module.id}": ((module) => {
            ${module._source}
            })
        `).join(',')
    }
    });
    var __webpack_module_cache__ = {};

    function require(moduleId) {
        var cachedModule = __webpack_module_cache__[moduleId];
        if (cachedModule !== undefined) {
            return cachedModule.exports
        }
        var module = __webpack_module_cache__[moduleId] = {
            exports: {}
        };
        __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
        return module.exports
    }
    var __webpack_exports__ = {};
    (() => {
        ${chunk.entryModule._source}
    })()
})();
     `
}

function tryExtensions(modulePath, extensions, originalModuleName, moduleContext) {
    extensions.unshift("")
    for (let i = 0; i < extensions.length; i++) {
        if (fs.existsSync(modulePath + extensions[i])) {
            return modulePath + extensions[i]
        }
    }
    throw new Error(`Module not found: Error: Can't resolve '${originalModuleName}' in '${moduleContext}'`)

}

module.exports = Compiler
