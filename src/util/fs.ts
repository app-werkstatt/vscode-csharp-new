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

export async function findMatchingFilesUp(
    folderUri: vscode.Uri,
    predicate: (
        name: string,
        type: vscode.FileType
    ) => Promise<boolean> | boolean,
    options: { singleResult: true }
): Promise<vscode.Uri | undefined>;

export async function findMatchingFilesUp(
    folderUri: vscode.Uri,
    predicate: (
        name: string,
        type: vscode.FileType
    ) => Promise<boolean> | boolean,
    options?: { singleResult: false }
): Promise<vscode.Uri[]>;

export async function findMatchingFilesUp(
    folderUri: vscode.Uri,
    predicate: (
        name: string,
        type: vscode.FileType
    ) => Promise<boolean> | boolean,
    options?: { singleResult: boolean }
): Promise<vscode.Uri[] | vscode.Uri | undefined> {
    const singleResult = options?.singleResult ?? false;
    const baseFolder = vscode.workspace.getWorkspaceFolder(folderUri)?.uri;

    if (baseFolder === undefined) {
        return singleResult ? undefined : [];
    }

    let currentFolder = folderUri;
    const multipleResults: vscode.Uri[] = [];

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const folderContents = await vscode.workspace.fs.readDirectory(
            currentFolder
        );

        for (const [name, type] of folderContents) {
            if (await predicate(name, type)) {
                const fileUri = vscode.Uri.joinPath(currentFolder, name);
                if (singleResult) {
                    return fileUri;
                } else {
                    multipleResults.push(fileUri);
                }
            }
        }

        if (
            currentFolder.path === baseFolder.path ||
            currentFolder.path === "/"
        ) {
            break;
        }

        currentFolder = vscode.Uri.joinPath(currentFolder, "..");
    }

    return singleResult ? undefined : multipleResults;
}
