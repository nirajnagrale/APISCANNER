# NodeAPIScanner
The deprecated API scanner in Node
NodeAPIScanner is a Visual Studio Code extension that scans and lists all deprecated APIs accessible by your Node.js application.


## fetchApi.js 
retrieves all deprecated functions from "https://nodejs.org/api/deprecations.json."


## makeAst.js 
creates an abstract syntax tree from an input file.
Returns all variables to their original values.


## checkDeprecation.js 
searches the AST for deprecation.


## main.js 
The primary task is to make the call. In sequence, fetchApi->makeAst->checkDeprecation


## extension.js 
calls main to collect all deprecated APIs and highlights the content.
This process occurs every second.
Depending on the type of deprecation, highlights appear in three different colours.
Red indicates End-of-Life deprecation.
Yellow indicates runtime deprecation.
Green indicates documentation-only deprecation.
Show the alternative API on hover




<img width="354" alt="program cycle" src="https://github.com/nirajnagrale/NodeAPIScanner/assets/41152282/831a6778-2ae9-40ca-804a-b9614ebfc316">


USING NODEAPISCANNER
Making Use of NodeAPIScanner:
(1) Download the extension nodeAPIScanner from the Visual
Studio Code Marketplace and install it.
(2) Open a Node.js project in Visual Studio Code.
(3) Launch the command palette and begin the command checkDeprecatedAPI
The plugin will analyse the code automatically and provide
real-time feedback on deprecated API usage.
(4) When a deprecated API is found, NodeAPIScanner will highlight text and, if available, the proposed alternative API.


