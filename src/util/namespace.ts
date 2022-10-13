import path = require("path");
import * as vscode from "vscode";
import { findMatchingFilesUp } from "./fs";
import { Settings } from "./settings";

export interface RootNamespace {
    readonly name: string;
    readonly baseUri: vscode.Uri;
}

export async function resolveNamespace(
    folderUri: vscode.Uri,
    settings: Settings
): Promise<string | undefined> {
    const rootNamespace =
        settings.rootNamespace ??
        (await determineRootNamespaceFromProjects(folderUri));

    if (rootNamespace === undefined) {
        return undefined;
    }

    if (!settings.namespaceFollowsFolders) {
        return rootNamespace.name;
    }

    let currentFolder = folderUri;
    const childNamespaces: string[] = [];

    while (currentFolder.path !== rootNamespace.baseUri.path) {
        if (currentFolder.path === "/") {
            return undefined;
        }

        const folderName = path.basename(currentFolder.path);
        const namespace = identifierFromString(folderName);

        childNamespaces.push(namespace);

        currentFolder = vscode.Uri.joinPath(currentFolder, "..");
    }

    return rootNamespace.name + "." + childNamespaces.reverse().join(".");
}

async function determineRootNamespaceFromProjects(
    folderUri: vscode.Uri
): Promise<RootNamespace | undefined> {
    const csprojUri = await findMatchingFilesUp(folderUri, isCsprojFile, {
        singleResult: true,
    });

    if (csprojUri === undefined) {
        return undefined;
    }

    const name = determineNamespaceFromProject(csprojUri);
    const baseUri = vscode.Uri.joinPath(csprojUri, "..");

    return { name, baseUri };
}

function determineNamespaceFromProject(csprojUri: vscode.Uri): string {
    return path.basename(csprojUri.path, ".csproj");
}

function isCsprojFile(name: string, type: vscode.FileType): boolean {
    return name.endsWith(".csproj") && type === vscode.FileType.File;
}

function identifierFromString(str: string): string {
    return str;
}
