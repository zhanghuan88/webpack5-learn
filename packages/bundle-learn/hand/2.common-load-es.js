var modules = {
    "./src/title.js": function (module, exports, require) {
        require.rankEsModule(exports)//标识es模块
        require.defineProperties(exports, { //定义属性
            default: () => DEFAULT_EXPORTS,
            age: () => age
        })
        const DEFAULT_EXPORTS = "title_default"
        const age = "title_age"

    }
}

var cache = {}

function require(moduleId) {
    if (cache[moduleId] !== undefined) {
        return cache[moduleId].exports;
    }
    var module = cache[moduleId] = {
        exports: {}
    };
    modules[moduleId](module, module.exports, require);
    return module.exports;
}

require.rankEsModule = function (exports) {
    Object.defineProperty(exports, Symbol.toStringTag, {value: "Module"});
    Object.defineProperty(exports, "__esModule", {value: true});
}
require.ownProperty = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
require.defineProperties = function (exports, definition) {
    for (let key in definition) {
        if (require.ownProperty(definition, key) && !require.ownProperty(exports, key)) {
            Object.defineProperty(exports, key, {enumerable: true, get: definition[key]});
        }
    }
}
let title = require('./src/title.js')
console.log(title.default)
console.log(title.age)
