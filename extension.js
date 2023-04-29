let vscode = require('vscode');
let main = require('./src/main.js');
let TurndownService = require('turndown');

let turndownService = new TurndownService();

let decorationTypes = {
    'Runtime deprecation': vscode.window.createTextEditorDecorationType({
        backgroundColor: 'yellow',
        color: 'white'
    }),
    'Documentation-only': vscode.window.createTextEditorDecorationType({
        backgroundColor: 'green',
        color: 'white'
    }),
    default: vscode.window.createTextEditorDecorationType({
        backgroundColor: 'red',
        color: 'white'
    })
};

async function getDeprecatedApiUsages() {
    let filePath = vscode.window.activeTextEditor.document.fileName;
    let deprecatedApiUsages = [];
    deprecatedApiUsages = await main.main(filePath);
    return deprecatedApiUsages;
}

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
            console.warn(`Unexpected apiType "${apiType}" encountered. Using default decoration list.`);
            decorationLists[apiType] = [];
        }

        decorationLists[apiType].push(decoration);
    });

    for (let apiType in decorationLists) {
        let decorationType = decorationTypes[apiType] || decorationTypes.default;
        vscode.window.activeTextEditor.setDecorations(decorationType, decorationLists[apiType]);
    }
}

function activate(context) {
    let disposable = vscode.commands.registerCommand('nodedeprecatedapi.helloWorld', async () => {
        let deprecatedApiUsages = [];
        deprecatedApiUsages = await getDeprecatedApiUsages();
        displayDecoration(deprecatedApiUsages);
    });

    context.subscriptions.push(disposable);

    let intervalId = setInterval(async () => {
        let deprecatedApiUsages = [];
        deprecatedApiUsages = await getDeprecatedApiUsages();
        displayDecoration(deprecatedApiUsages);
    }, 15000);

    context.subscriptions.push({
        dispose: () => {
            clearInterval(intervalId);
        }
    });
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
