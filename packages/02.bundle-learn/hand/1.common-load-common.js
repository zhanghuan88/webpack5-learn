var modules = {
    "./src/title.js": function (module, exports, require) {
        module.exports = "title"
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

let title = require("./src/title.js")
console.log(title)
