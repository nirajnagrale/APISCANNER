const fs = require('fs');
const parser = require('@babel/parser');
const _traverse = require('@babel/traverse');

const traverse = _traverse.default;



// This code checks if the API is deprecated.
// If it is deprecated, it returns the deprecated API object.
// If it is not deprecated, it returns an empty object.
function checkIfDeprecatedApi(api,deprecatedAPIs) {
    for (let i = 0; i < deprecatedAPIs.length; i++) {
        if (api === deprecatedAPIs[i].api) {
            return deprecatedAPIs[i];
        }
    }
    return {};
}



function traverseMemberExpression(node) {


    if (node.type === "Identifier")
        return node.name;
    let leftExpr = "";
    let RightExpr = "";
    if (node.type === "MemberExpression") {
        leftExpr = traverseMemberExpression(node.object);
        RightExpr = traverseMemberExpression(node.property)
    }
    return leftExpr + "." + RightExpr;
}

function traverseCallExpression(node) {
    let expr = traverseMemberExpression(node.callee);
    expr += "(";
    if (node.arguments.length > 0) {
        for (let i = 0; i < node.arguments.length; i++) {
            expr += node.arguments[i].value + ",";
        }
        expr = expr.substring(0, expr.length - 1);
    }
    expr += ")";
    return expr;
}

function checkDeprecation(ast,deprecatedAPIs) {
    deprecatedAPIUsages = [];
    traverse(ast, {
        MemberExpression(path) {
            let api = traverseMemberExpression(path.node)
            let module = checkIfDeprecatedApi(api,deprecatedAPIs);
            if (Object.keys(module).length > 0) {
                deprecatedAPIUsages.push({ "module": module, "api": api, "start": path.node.loc.start, "end": path.node.loc.end })
            }
           
        },
        Identifier(path) {
            const { node, parent } = path;
            const { name } = node;
            let api = name;
            let module = checkIfDeprecatedApi(api,deprecatedAPIs);
            if (Object.keys(module).length > 0) {
                deprecatedAPIUsages.push({ "module": module, "api": api, "start": path.node.loc.start, "end": path.node.loc.end })
            }
           
        }, CallExpression(path) {
            let api = traverseCallExpression(path.node)
            let module = checkIfDeprecatedApi(api,deprecatedAPIs);
            if (Object.keys(module).length > 0) {
                deprecatedAPIUsages.push({ "module": module, "api": api, "start": path.node.loc.start, "end": path.node.loc.end})
            }
           
            else {
                //remove () from api and check
                // Use a regular expression to find all instances of parentheses and their contents
                let regex = /\([^)]*\)/g;

                // Replace all instances of the regex with an empty string
                api = api.replace(regex, '');
                let module = checkIfDeprecatedApi(api,deprecatedAPIs);
                if (Object.keys(module).length > 0) {
                    deprecatedAPIUsages.push({ "module": module, "api": api, "start": path.node.loc.start, "end": path.node.loc.end })
                }

            }
        }
    })
    return deprecatedAPIUsages;
}


module.exports =  { checkDeprecation}
