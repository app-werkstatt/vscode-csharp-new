import { SnippetString, Uri, window, workspace } from "vscode";
import { pickFileConfiguration } from "../pickers/file-configuration";

export async function newFile(uri: Uri) {
    console.log("Create new type file...", uri.toString());

    const config = await pickFileConfiguration(uri);
    if (!config) {
        console.info("Create new file aborted");
        return;
    }

    await workspace.fs.writeFile(config.fileUri, new Uint8Array());

    const document = await workspace.openTextDocument(config.fileUri);
    const editor = await window.showTextDocument(document);

    const snippet = new SnippetString()
        .appendChoice(["public", "internal"])
        .appendText(` ${config.typeKind} ${config.typeName} {\n\t`)
        .appendTabstop()
        .appendText("\n}");

    editor.insertSnippet(snippet);
}
