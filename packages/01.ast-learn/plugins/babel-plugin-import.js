let babel = require('@babel/core');
let t = require('babel-types');

//import {flatten,concat} from 'lodash';
//import flatten from 'lodash/flatten';
//import concat from 'lodash/concat';
const visitor = {
    ImportDeclaration(nodePath, state) {
        let {opts } = state;
        let {node} = nodePath
        let specifiers = node.specifiers;
        let source = node.source;//StringLiteral loadash
        if(opts.library===source.value&&!t.isImportDefaultSpecifier(specifiers[0])){
            const importDeclarations = specifiers.map((specifier, index) => {
                return t.importDeclaration([
                    t.importDefaultSpecifier(specifier.local)
                ], t.stringLiteral(`${source.value}/${specifier.imported.name}`))
            })
            if(importDeclarations.length > 0){
                nodePath.replaceWith(importDeclarations[0])
            }else {
                nodePath.replaceWithMultiple(importDeclarations)
            }
        }


    }
}
module.exports = function () {
    return {
        visitor
    }
}
