let makeAst = require('./makeAst.js');
let checkDeprecation = require('./checkDeprecation.js');
let fetchAPIs = require('./fetchApi.js');
const { default: traverse } = require('@babel/traverse');

async function main(filePath) {
   
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
    let ast = makeAst.makeAst(filePath);
    let deprecatedAPIUsages = checkDeprecation.checkDeprecation(ast, deprecatedAPIs);
    return deprecatedAPIUsages;
}

module.exports = {
    main
}