/**
 * This is a VS Code extension that checks for deprecated Node.js APIs in the active text editor and
 * displays them as decorations.
 * @returns The module.exports object with the activate and deactivate functions.
 */
let vscode = require('vscode');
let main = require('./src/main.js');

let TurndownService = require('turndown');

let turndownService = new TurndownService();
/* `decorationTypes` is an object that contains three properties, each of which is a
TextEditorDecorationType created using the `vscode.window.createTextEditorDecorationType()` method.
These decoration types are used to highlight different types of deprecated Node.js APIs in the
active text editor. */

let decorationTypes = {
    'Runtime deprecation': vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 255, 0, 0.5)',
        color: 'black'
    }),
    'Documentation-only': vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(0, 255, 0, 0.5)',
        color: 'black'
    }),
    default: vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
        color: 'black'
    })
};

/**
 * This function retrieves any deprecated API usages in the active text editor's file content.
 * @returns The function `getDeprecatedApiUsages` returns a promise that resolves to an array of
 * deprecated API usages.
 */
async function getDeprecatedApiUsages() {
    let fileContent = vscode.window.activeTextEditor.document.getText();
    let deprecatedApiUsages = [];
    deprecatedApiUsages = await main.main(fileContent);
    return deprecatedApiUsages;
}

/**
 * This function takes in a list of deprecated API usages and displays them as decorations in the
 * active text editor.
 * @param deprecatedApiUsages - `deprecatedApiUsages` is an array of objects representing the usage of
 * deprecated APIs in the code. Each object contains information about the location of the usage (start
 * and end positions), the description of the deprecated API (in HTML format), and the type of the API
 * (e.g. "Runtime
 */
function displayDecoration(deprecatedApiUsages) {
    let decorationLists = {
        'Runtime deprecation': [],
        'Documentation-only': [],
        default: []
    };

    deprecatedApiUsages.forEach(apiUsage => {
        let start = new vscode.Position(apiUsage.start.line - 1, apiUsage.start.column);
        let end = new vscode.Position(apiUsage.end.line - 1, apiUsage.end.column);
        let range = new vscode.Range(start, end);

        let htmlDesc = apiUsage.module.desc;
        let markdownDesc = turndownService.turndown(htmlDesc);
        let hoverMessage = new vscode.MarkdownString(markdownDesc, true);
        let decoration = { range, hoverMessage };

        let apiType = apiUsage.module.apiType || 'default';

        if (!decorationLists[apiType]) {
            //console.warn(`Unexpected apiType "${apiType}" encountered. Using default decoration list.`);
            decorationLists[apiType] = [];
        }

        decorationLists[apiType].push(decoration);
    });

    for (let apiType in decorationLists) {
        let decorationType = decorationTypes[apiType] || decorationTypes.default;
        vscode.window.activeTextEditor.setDecorations(decorationType, decorationLists[apiType]);
    }
}

async function activate(context) {
    let disposable = vscode.commands.registerCommand('nodedeprecatedapi.checkDeprecation', async () => {
        let deprecatedApiUsages = [];
        deprecatedApiUsages = await getDeprecatedApiUsages();
        displayDecoration(deprecatedApiUsages);
    });

    context.subscriptions.push(disposable);

    // Call the functions directly to check deprecations on activation
    let deprecatedApiUsages = [];
    deprecatedApiUsages = await getDeprecatedApiUsages();
    displayDecoration(deprecatedApiUsages);

    let intervalId = setInterval(async () => {
        deprecatedApiUsages = [];
        deprecatedApiUsages = await getDeprecatedApiUsages();
        displayDecoration(deprecatedApiUsages);
    }, 1000);

    context.subscriptions.push({
        dispose: () => {
            clearInterval(intervalId);
        }
    });
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};
