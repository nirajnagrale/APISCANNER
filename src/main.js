// This is the main function that is used to run the whole program.
// The main function takes a file path as input and returns an array of deprecated API usages.
// The main function uses the makeAst module to create the AST from the file path.
// The main function uses the checkDeprecation module to check if there are any deprecated API usages in the AST.

let makeAst = require('./makeAst.js');
let checkDeprecation = require('./checkDeprecation.js');
let fetchAPIs = require('./fetchApi.js');
const { default: traverse } = require('@babel/traverse');

async function main(fileContent) {
   
    const json = await fetchAPIs.fetchJSON('https://nodejs.org/api/deprecations.json');
    let deprecatedAPIs = json.miscs[0].miscs[1].modules;
    // loop through the deprecatedApi array and add a new attribute named "api"
    deprecatedAPIs.forEach(function (module) {
        const regex = /`([^`]*)`/;
        const match = module.textRaw.match(regex);
        if (match) {
            module.api = match[1].replace(/`/g, "");

        }
        if(module.desc.includes("End-of-Life")) {
            module.apiType = "End-of-Life";
        }else if(module.desc.includes("Documentation-only")) {
            module.apiType = "Documentation-only";
        }else{
            module.apiType = "Runtime deprecation";
        }
    });
    let ast = makeAst.makeAst(fileContent);
    let deprecatedAPIUsages = [];
    deprecatedAPIUsages = checkDeprecation.checkDeprecation(ast, deprecatedAPIs);
    return deprecatedAPIUsages;
}

module.exports = {
    main
}