import { SnippetString, Uri, window, workspace } from "vscode";
import { NewFileConfiguration } from "../pickers/file-configuration-picker";

export async function newFile(uri: Uri) {
    console.log("Create new type file...", uri.toString());

    const config = await readConfiguration(uri);
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

async function readConfiguration(
    folderUri: Uri
): Promise<NewFileConfiguration | undefined> {
    const typeKind = await window.showQuickPick(
        ["class", "record", "struct", "record struct", "enum"],
        { title: "Select type kind" }
    );
    const typeName = await window.showInputBox({
        title: "Enter type name",
    });

    if (!typeKind || !typeName) {
        return undefined;
    }

    const fileUri = Uri.joinPath(folderUri, `${typeName}.cs`);

    const selectedFileUri = await window.showSaveDialog({
        defaultUri: fileUri,
    });

    console.log(selectedFileUri?.toString());

    return { typeKind, typeName, fileUri };
}
