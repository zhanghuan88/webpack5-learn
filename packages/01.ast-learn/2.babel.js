let core = require('@babel/core');
let types = require('babel-types');
let arrowFunction = require("babel-plugin-transform-es2015-arrow-functions");
const {re} = require('@babel/core/lib/vendor/import-meta-resolve')
let es6Code = `
const sum = (a,b)=>{
    console.log(this)
    return a+b
}
`
//babel插件就是一个js对象，里面会有属性visitor对象
//插件的核心就是将老的语法树转成新的语法树
let arrowFunction2 = {
    visitor: {
        ArrowFunctionExpression(nodePath) {
            let node = nodePath.node
            hoistFunctionEnvironment(nodePath);//处理箭头函数中的this
            node.type = "FunctionExpression"
        }
    }
}

function hoistFunctionEnvironment(fnPath) {
    //找this的环境
    const thisEnv = fnPath.findParent(p => {
        return (p.isFunction() && !p.isArrowFunctionExpression()) || p.isProgram();
    })
    //找当前作用域哪边用到了this
    let thisPaths = getScopeThisPaths(fnPath);
    let thisBinding = '_this';
    if (thisPaths.length > 0) {
        thisEnv.scope.push({
            id: types.identifier(thisBinding),
            init: types.thisExpression()
        })
        thisPaths.forEach(thisPath => {
            let thisBindRef = types.identifier(thisBinding);
            thisPath.replaceWith(thisBindRef);
        })
    }
}

function getScopeThisPaths(fnPath) {
    let thisPaths = [];
    fnPath.traverse({
        ThisExpression(thisPath) {
            thisPaths.push(thisPath);
        }
    })
    return thisPaths;
}

let es5Code = core.transform(es6Code, {
    plugins: [arrowFunction2]
})
console.log(es5Code.code)
