let esprima = require('esprima');
let estraverse = require('estraverse');
let escodegen = require('escodegen');
let code = `function ast(){}`
let ast = esprima.parseScript(code);

let indent = 0;//缩进空格数
const padding = () => ' '.repeat(indent);
//estraverse会已深度优先的方式遍历ast
//每个节点都会触发enter和leave事件
estraverse.traverse(ast, {
    enter(node) {
        console.log(`${padding()}${node.type}进入`)
        if (node.type === "FunctionDeclaration") {
            node.id.name = 'newAst'
        }
        indent += 2
    },
    leave(node) {
        indent -= 2
        console.log(`${padding()}${node.type}离开`)
    }
})
let result = escodegen.generate(ast);
console.log(result)
