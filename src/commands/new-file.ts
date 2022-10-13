import * as vscode from "vscode";
import { pickFileConfiguration } from "../pickers/file-configuration";

export async function newFile(uri: vscode.Uri) {
    const config = await pickFileConfiguration(uri);
    if (!config) {
        console.info("Create new file aborted");
        return;
    }

    await vscode.workspace.fs.writeFile(config.fileUri, new Uint8Array());

    const document = await vscode.workspace.openTextDocument(config.fileUri);
    const editor = await vscode.window.showTextDocument(document);

    let snippet = new vscode.SnippetString();

    if (config.namespace) {
        snippet.appendLine(`namespace ${config.namespace};`).appendLine();
    }

    snippet = snippet
        .appendChoice(["public", "internal"])
        .appendLine(` ${config.typeKind} ${config.typeName} {`)
        .appendText("\n\t")
        .appendTabstop(0)
        .appendLine("\n}");

    editor.insertSnippet(snippet);
}
