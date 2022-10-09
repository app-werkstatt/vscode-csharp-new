import * as vscode from "vscode";

export async function fileExists(uri: vscode.Uri): Promise<boolean> {
    try {
        await vscode.workspace.fs.stat(uri);
        return true; // if we reach here, the file exists
    } catch (e) {
        if (e instanceof vscode.FileSystemError && e.code === "FileNotFound") {
            return false; // file was not found
        } else {
            return true; // some other error
        }
    }
}
