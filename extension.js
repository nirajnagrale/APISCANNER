const vscode = require('vscode');
const main = require('./src/main.js');

const decorationTypes = {
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
    const filePath = vscode.window.activeTextEditor.document.fileName;
    const deprecatedApiUsages = await main.main(filePath);
    return deprecatedApiUsages;
}

function displayDecoration(deprecatedApiUsages) {
    const decorationLists = {
        'Runtime deprecation': [],
        'Documentation-only': [],
        default: []
    };

    deprecatedApiUsages.forEach(apiUsage => {
        const start = new vscode.Position(apiUsage.start.line - 1, apiUsage.start.column);
        const end = new vscode.Position(apiUsage.end.line - 1, apiUsage.end.column);
        const range = new vscode.Range(start, end);
        const hoverMessage = new vscode.MarkdownString(apiUsage.module.desc, true);
        const decoration = { range, hoverMessage };

        const apiType = apiUsage.module.apiType || 'default';

        decorationLists[apiType].push(decoration);
    });

    for (const apiType in decorationLists) {
        const decorationType = decorationTypes[apiType] || decorationTypes.default;
        vscode.window.activeTextEditor.setDecorations(decorationType, decorationLists[apiType]);
    }
}

function activate(context) {
    const disposable = vscode.commands.registerCommand('nodedeprecatedapi.helloWorld', async () => {
        const deprecatedApiUsages = await getDeprecatedApiUsages();
        displayDecoration(deprecatedApiUsages);
    });

    context.subscriptions.push(disposable);

    const intervalId = setInterval(async () => {
        const deprecatedApiUsages = await getDeprecatedApiUsages();
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
