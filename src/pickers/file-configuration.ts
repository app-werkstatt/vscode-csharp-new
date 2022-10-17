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

    const fileUri = gatheredInfo.fileUri;
    const type = buildTypeDeclaration(
        gatheredInfo.typeKind,
        gatheredInfo.typeName
    );
    const namespace = await namespacePromise;

    return { fileUri, type, namespace };
}

export interface NewFileConfiguration {
    readonly fileUri: vscode.Uri;
    readonly type: TypeDeclaration;
    readonly namespace: Namespace | undefined;
}

export interface TypeDeclaration {
    readonly keyword: string;
    readonly name: string;
    readonly attributes: string[];
    readonly style: "block" | "primary";
}

export interface Namespace {
    readonly name: string;
    readonly scope: "block" | "file";
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
): Promise<Namespace | undefined> {
    const settings = await readSettings(folderUri);
    const namespace = await resolveNamespace(folderUri, settings);

    if (namespace === undefined) {
        return undefined;
    }

    return { name: namespace, scope: settings.namespaceScope };
}

function buildTypeDeclaration(
    typeKind: string,
    typeName: string
): TypeDeclaration {
    const name = typeName;
    let keyword: string = typeKind;
    let attributes: string[] = [];
    let style: "block" | "primary" = "block";

    if (typeKind === "record" || typeKind === "record struct") {
        style = "primary";
    }

    if (typeKind === "[Flags] enum") {
        keyword = "enum";
        attributes = ["Flags"];
    }

    return { keyword, name, attributes, style };
}
