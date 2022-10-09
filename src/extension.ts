import * as vscode from "vscode";
import { newFile } from "./commands/new-file";

declare module "vscode" {
    export interface SnippetString {
        appendLine(line?: string): SnippetString;
    }
}

export function activate(context: vscode.ExtensionContext) {
    vscode.SnippetString.prototype.appendLine = function (line?: string) {
        return this.appendText((line ?? "") + "\n");
    };

    context.subscriptions.push(
        vscode.commands.registerCommand("csharp-new.new-file", newFile)
    );
}

export function deactivate() {
    // nothing to do
}
