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









