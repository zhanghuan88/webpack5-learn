var modules = {
    "./src/title.js": function (module, exports, require) {
        module.exports = {
            title: "title_default",
            age: "title_age"
        }
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
require.needDefault = function (module) {
    let getter = module['__esModule'] ? () => module['default'] : () => module
    return getter
}
var exports = {}
require.rankEsModule(exports)
let title = require('./src/title.js')
let title_default = require.needDefault(title)
console.log(title_default())
console.log(title.age)
