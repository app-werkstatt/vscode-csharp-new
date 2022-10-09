import * as vscode from "vscode";
import { fileExists } from "../util/fs";
import { MultiStepInput } from "../util/multi-step-input";

export async function pickFileConfiguration(
    folderUri: vscode.Uri
): Promise<NewFileConfiguration | undefined> {
    const input = {
        folderUri,
        namespace: undefined,
    };

    return await MultiStepInput.from(input)
        .addStep(pickTypeKindStep)
        .addStep(pickTypeNameStep)
        .run();
}

export interface NewFileConfiguration {
    fileUri: vscode.Uri;
    typeKind: string;
    typeName: string;
    namespace: string | undefined;
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
