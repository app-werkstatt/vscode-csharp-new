import { TextEncoder } from "util";
import { commands, Uri, workspace } from "vscode";

export async function createNewTypeFile(uri: Uri) {
    console.log("Create new type file...", uri.toString());

    const content = "class FooFile {}";

    const encoder = new TextEncoder();
    const encoded = encoder.encode(content);

    const fileUri = Uri.joinPath(uri, "FooFile.cs");

    await workspace.fs.writeFile(fileUri, encoded);
    await commands.executeCommand('vscode.open', fileUri);
}