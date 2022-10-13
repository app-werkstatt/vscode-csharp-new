import { TextDecoder } from "util";
import * as vscode from "vscode";
import { findMatchingFilesUp } from "./fs";
import { RootNamespace } from "./namespace";

export interface Settings {
    readonly rootNamespace: RootNamespace | undefined;
    readonly namespaceFollowsFolders: boolean;
}

interface SettingsFile {
    readonly rootNamespace: string | undefined;
    readonly namespaceFollowsFolders: boolean | undefined;
}

export async function readSettings(folderUri: vscode.Uri): Promise<Settings> {
    const settingsFiles = await findMatchingFilesUp(folderUri, isSettingsFile);

    let settings: Settings = {
        rootNamespace: undefined,
        namespaceFollowsFolders: true,
    };

    let fileUri: vscode.Uri | undefined;
    while ((fileUri = settingsFiles.pop())) {
        const settingsFile = await readSettingsFile(fileUri);
        settings = applySettings(settings, settingsFile, fileUri);
    }

    return settings;
}

async function readSettingsFile(
    fileUri: vscode.Uri
): Promise<SettingsFile | undefined> {
    try {
        const dataBuffer = await vscode.workspace.fs.readFile(fileUri);
        const data = JSON.parse(new TextDecoder().decode(dataBuffer));

        const rootNamespace = data.rootNamespace as string | undefined;
        const namespaceFollowsFolders = data.namespaceFollowsFolders as
            | boolean
            | undefined;

        return { rootNamespace, namespaceFollowsFolders };
    } catch (e) {
        console.error("Error reading settings file", fileUri.toString(), e);
        return undefined;
    }
}

function applySettings(
    settings: Settings,
    settingsFile: SettingsFile | undefined,
    fileUri: vscode.Uri
): Settings {
    if (settingsFile === undefined) {
        return settings;
    }

    let newSettings = settings;
    if (
        settingsFile.rootNamespace !== undefined &&
        settingsFile.rootNamespace.length > 0
    ) {
        newSettings = {
            ...newSettings,
            rootNamespace: {
                name: settingsFile.rootNamespace,
                baseUri: vscode.Uri.joinPath(fileUri, ".."),
            },
        };
    }

    if (settingsFile.namespaceFollowsFolders !== undefined) {
        newSettings = {
            ...newSettings,
            namespaceFollowsFolders: settingsFile.namespaceFollowsFolders,
        };
    }

    return newSettings;
}

function isSettingsFile(name: string, type: vscode.FileType): boolean {
    return type === vscode.FileType.File && name === ".csharp-new.config.json";
}
