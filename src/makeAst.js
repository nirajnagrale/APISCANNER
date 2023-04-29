const fs = require('fs')
const parser = require('@babel/parser');
const _traverse = require('@babel/traverse');

const traverse = _traverse.default;
//const traverse = _traverse.default;
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

function makeAst(filePath) {
   
    const code = fs.readFileSync(filePath, 'utf-8');

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
    makeAst,
    varValue
}