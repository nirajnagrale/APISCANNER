## Node Deprecated API SCANNER
NodeAPIScanner is a VS Code extension that allows you to scan and list all the deprecated APIs exposed by your Node.js application.

# fetchApi

fetches all deprecated from 'https://nodejs.org/api/deprecations.json'

# makeAst

takes input file and makes Abstract Syntax Tree. 
Changes all the variable declaration to its original values.

# checkDeprecation

traverses the AST and checks for deprecation

# main

Responsiblity of main is to call is to call fetchApi->makeAst->checkDeprecation in order

# extension.js

collects all deprecatdAPI by calling main and highlights the the text.
This process is done every second.
highlights in three different colors depending on type of deprecation
Red => End-of-Life deprecation
Yellow => Runtime deprecation
Green => Documentation only





