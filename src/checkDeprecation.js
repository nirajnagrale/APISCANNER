/**
 * The above code exports a function that checks for deprecated API usage in a JavaScript abstract
 * syntax tree (AST) using Babel parser and traverse.
 * @param api - The name of an API being checked for deprecation.
 * @param deprecatedAPIs - An array of objects representing deprecated APIs. Each object should have
 * properties: "api" (string) representing the name of the deprecated API, and "module" (string)
 * representing the name of the module where the API is deprecated.
 * @returns The module exports an object with a single function called `checkDeprecation`. This
 * function takes two arguments: `ast` and `deprecatedAPIs`. It traverses the `ast` using
 * `@babel/traverse` and checks if any of the APIs used in the code are deprecated by comparing them
 * with the `deprecatedAPIs` array. If a deprecated API is found, the function adds
 */
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
            if(node.arguments[i].type === "StringLiteral")
            expr += "\'" + node.arguments[i].value + "\'" + ",";
            else{
                expr += node.arguments[i].value + ",";
            }
          
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
                apiWithArg = api.replace(regex, '()');
                let module = checkIfDeprecatedApi(apiWithArg,deprecatedAPIs);
                if (Object.keys(module).length > 0) {
                    deprecatedAPIUsages.push({ "module": module, "api": apiWithArg, "start": path.node.loc.start, "end": path.node.loc.end })
                }
                
                //remove arguments from api and check
                let apiWithoutArg = api.replace(regex, '');
                module = checkIfDeprecatedApi(apiWithoutArg,deprecatedAPIs);
                if (Object.keys(module).length > 0) {
                    deprecatedAPIUsages.push({ "module": module, "api": apiWithoutArg, "start": path.node.loc.start, "end": path.node.loc.end })
                }

            }
        }
    })
    return deprecatedAPIUsages;
}


module.exports =  { checkDeprecation}
