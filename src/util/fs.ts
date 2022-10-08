import { FileSystemError, Uri, workspace } from "vscode";

export async function fileExists(uri: Uri): Promise<boolean> {
    try {
        await workspace.fs.stat(uri);
        return true; // if we reach here, the file exists
    } catch (e) {
        if (e instanceof FileSystemError && e.code === "FileNotFound") {
            return false; // file was not found
        } else {
            return true; // some other error
        }
    }
}
