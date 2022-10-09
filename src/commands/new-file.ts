import * as vscode from "vscode";
import { pickFileConfiguration } from "../pickers/file-configuration";

export async function newFile(uri: vscode.Uri) {
    console.log("Create new type file...", uri.toString());

    const config = await pickFileConfiguration(uri);
    if (!config) {
        console.info("Create new file aborted");
        return;
    }

    await vscode.workspace.fs.writeFile(config.fileUri, new Uint8Array());

    const document = await vscode.workspace.openTextDocument(config.fileUri);
    const editor = await vscode.window.showTextDocument(document);

    console.log("Add namespace", config.namespace);

    const snippet = new vscode.SnippetString()
        .appendChoice(["public", "internal"])
        .appendText(` ${config.typeKind} ${config.typeName} {\n\t`)
        .appendTabstop()
        .appendText("\n}");

    editor.insertSnippet(snippet);
}
