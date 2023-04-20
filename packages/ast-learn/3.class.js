let core = require('@babel/core');
let t = require('babel-types');
let TransformClasses = require("@babel/plugin-transform-classes");
let es6Code = `
    class Person{
        constructor(name){
            this.name = name
        }
        getName(){
            return this.name
        }
    }
`
let TransformClasses2 = {
    visitor: {
        ClassDeclaration(nodePath) {
            let {node} = nodePath;
            let id = node.id //{type:"Identifier",name:"Person"}
            let methods = node.body.body;
            let functions = [];
            methods.forEach(method => {
                if (method.kind === "constructor") {
                    let constructorFunction = t.functionDeclaration(id, method.params, method.body, method.generate, method.async)
                    functions.push(constructorFunction)
                } else {
                    let prototypeMemberExpression = t.memberExpression(id, t.identifier('prototype'));//Person.prototype
                    //Person.prototype.getName
                    let getNameMemberExpression = t.memberExpression(prototypeMemberExpression, method.key);
                    //Person.prototype.getName=function(){}
                    let assignmentExpression = t.assignmentExpression('=', getNameMemberExpression,
                        t.functionExpression(null, method.params, method.body, false, false))
                    let expressionStatement = t.expressionStatement(assignmentExpression);
                    functions.push(expressionStatement);
                }
            })
            nodePath.replaceWithMultiple(functions);
        }
    }
}
let es5Code = core.transform(es6Code, {
    plugins: [TransformClasses2]
})
console.log(es5Code.code)
