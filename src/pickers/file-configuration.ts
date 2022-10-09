import path = require("path");
import * as vscode from "vscode";
import { fileExists } from "../util/fs";
import { MultiStepInput } from "../util/multi-step-input";

export async function pickFileConfiguration(
    folderUri: vscode.Uri
): Promise<NewFileConfiguration | undefined> {
    const namespacePromise = determineNamespace(folderUri);

    const gatheredInfo = await MultiStepInput.from({ folderUri })
        .addStep(pickTypeKindStep)
        .addStep(pickTypeNameStep)
        .run();

    if (gatheredInfo === undefined) {
        return undefined;
    }

    return { ...gatheredInfo, namespace: await namespacePromise };
}

export interface NewFileConfiguration {
    readonly fileUri: vscode.Uri;
    readonly typeKind: string;
    readonly typeName: string;
    readonly namespace: string | undefined;
}

async function determineNamespace(
    folderUri: vscode.Uri
): Promise<string | undefined> {
    const baseFolder = vscode.workspace.getWorkspaceFolder(folderUri)?.uri;
    if (baseFolder === undefined) {
        return undefined;
    }

    let currentFolder = folderUri;

    console.log("Base folder", baseFolder.toString());

    // eslint-disable-next-line no-constant-condition
    while (true) {
        console.log("Current folder", currentFolder.toString());
        const folderContents = await vscode.workspace.fs.readDirectory(
            currentFolder
        );

        for (const [name, type] of folderContents) {
            if (name.endsWith(".csproj") && type === vscode.FileType.File) {
                const csprojUri = vscode.Uri.joinPath(currentFolder, name);

                console.log("Found csproj", csprojUri.toString());

                return determineNamespaceFromProject(csprojUri);
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

    return undefined;
}

async function determineNamespaceFromProject(
    csprojUri: vscode.Uri
): Promise<string | undefined> {
    return path.basename(csprojUri.path, ".csproj");
}

async function pickTypeKindStep(
    input: MultiStepInput
): Promise<{ typeKind: string }> {
    const { label: typeKind } = await input.showQuickPick(
        [
            { label: "class" },
            { label: "record" },
            { label: "interface" },
            { label: "struct" },
            { label: "record struct" },
            { label: "enum" },
        ],
        { title: "Select type kind" }
    );
    return { typeKind };
}

async function pickTypeNameStep(
    input: MultiStepInput,
    values: { folderUri: vscode.Uri }
): Promise<{ typeName: string; fileUri: vscode.Uri }> {
    const typeName = await input.showInputBox({ title: "Enter type name" });
    let fileUri = vscode.Uri.joinPath(values.folderUri, `${typeName}.cs`);

    if (await fileExists(fileUri)) {
        fileUri = await input.showSaveDialog({
            title: "Create new file",
            defaultUri: fileUri,
        });
    }

    return { typeName, fileUri };
}
