// NOTE(alex): It starts out not working, must compile the typescript first with `tsc --watch`.

// NOTE(alex): Use webpack, otherwise webassembly modules from rust will give an error because of
// commonjs:
// "vscode extension cannot use import statement outside a module"

// NOTE(alex): `output.publicPath` cannot be set to "auto", if it isn't empty we get an error saying
// that "automatic is not supported in this browser".

// TypeError: (0 , xt_wasm_1.greet) is not a function

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import fetch from "node-fetch";

// NOTE(alex): Made it work!
//
// These commands must be run inside their respectives project directories.
// 1. Compile wasm project with `wasm-pack build --target nodejs`;
// 2. Must copy the `.wasm` file to the extension `dist` folder;
// 3. Use `webpack.config.js` via `npm run build` that is setup in `package.json`;
import { greet } from "xt-wasm";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "xt" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("xt.requestXT", () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage("Hello World from xt!");

    let greeting = greet();
    vscode.window.showInformationMessage("greeting is ", greeting);
    // makeRequest().then(() => {
    //   vscode.window.showInformationMessage("Done with rust wasm request!");
    // });
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
