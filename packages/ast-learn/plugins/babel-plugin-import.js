let core = require("@babel/core");
let t = require("babel-types");
let visitor = {
    ImportDeclaration(nodePath) {
        console.log(nodePath)
    }
}
module.exports = {
    visitor
}
