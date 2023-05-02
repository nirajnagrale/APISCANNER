/**
 * The function makes an AST (Abstract Syntax Tree) for a given file using Babel parser and traverse,
 * and also includes functionality to change variable names to their original values.
 * @param node - This refers to the current node being traversed in the AST (Abstract Syntax Tree) by
 * the Babel parser. The AST is a tree-like data structure that represents the structure of the code in
 * an abstract way, making it easier to analyze and manipulate programmatically.
 * @returns The module exports an object with two properties: `makeAst` and `varValue`. The `makeAst`
 * function takes a file path as an argument, reads the file, parses it using Babel parser, and returns
 * an abstract syntax tree (AST) for the file. The `varValue` property is a Map object that stores the
 * values of variables in the code.
 */
// This code is used to make an ast for a given file

const fs = require('fs')
const parser = require('@babel/parser');
const _traverse = require('@babel/traverse');

const traverse = _traverse.default;

let varValue = new Map();

function changeToOrignalVar(node) {
    if (node.type === "Identifier") {
        if (varValue.has(node.name)) {
            node.name = varValue.get(node.name);
        }
        return node.name;
    } else if (node.type === "MemberExpression") {
        let expr = changeToOrignalVar(node.object) + "." + changeToOrignalVar(node.property);
        return expr;
    } else if (node.type === "CallExpression") {
        let expr = changeToOrignalVar(node.callee)
        expr += "(";
        if (node.arguments.length > 0) {


            for (let i = 0; i < node.arguments.length; i++) {
                expr += node.arguments[i].name + ",";
            }
            expr = expr.substring(0, expr.length - 1);

        }
        expr += ")";
        return expr;
    }

}
let ast;

function makeAst(fileContent) {
   
    const code = fileContent;

    ast = parser.parse(code);
    traverse(ast, {
        enter: (path) => {
            let node = path.node;
            if (node.type === "VariableDeclarator" && node.init !== null) {
                let expr = changeToOrignalVar(node.init);
                varValue.set(node.id.name, expr);
            } else if (node.type === 'AssignmentExpression' && node.right !== null
                && node.operator === "=") {
                let expr = changeToOrignalVar(node.right);
                varValue.set(node.left.name, expr);
            } else if (node.type === "ExpressionStatement" && node.expression.type === "CallExpression") {
                let expr = changeToOrignalVar(node.expression);
            }

        }
    })
    return ast;
}


module.exports = {
    makeAst
}