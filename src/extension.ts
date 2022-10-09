import * as vscode from "vscode";
import { newFile } from "./commands/new-file";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("csharp-new.new-file", newFile)
    );
}

export function deactivate() {
    // nothing to do
}
