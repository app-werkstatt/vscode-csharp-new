import * as vscode from "vscode";
import { fileExists } from "../util/fs";
import { MultiStepInput } from "../util/multi-step-input";
import { resolveNamespace } from "../util/namespace";
import { readSettings } from "../util/settings";

export async function pickFileConfiguration(
    folderUri: vscode.Uri
): Promise<NewFileConfiguration | undefined> {
    const namespacePromise = readNamespace(folderUri);

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

async function pickTypeKindStep(
    input: MultiStepInput
): Promise<{ typeKind: string }> {
    const { label: typeKind } = await input.showQuickPick<vscode.QuickPickItem>(
        [
            { label: "class", detail: "Create a new class" },
            { label: "record", detail: "Create a new record" },
            { label: "interface", detail: "Create a new interface" },
            { label: "struct", detail: "Create a new struct" },
            { label: "record struct", detail: "Create a new record struct" },
            { label: "enum", detail: "Create a new enumeration" },
            {
                label: "[Flags] enum",
                detail: "Create a new numeration representing a set of flags",
            },
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

async function readNamespace(
    folderUri: vscode.Uri
): Promise<string | undefined> {
    const settings = await readSettings(folderUri);
    const namespace = await resolveNamespace(folderUri, settings);

    return namespace;
}
