import { Uri } from "vscode";
import { fileExists } from "../util/fs";
import { MultiStepInput } from "../util/multi-step-input";

export async function pickFileConfiguration(
    folderUri: Uri
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
    fileUri: Uri;
    typeKind: string;
    typeName: string;
    namespace: string | undefined;
}

async function pickTypeKindStep(
    input: MultiStepInput
): Promise<{ typeKind: string }> {
    const { label: typeKind } = await input.showQuickPick([
        { label: "class" },
        { label: "record" },
        { label: "interface" },
        { label: "struct" },
        { label: "record struct" },
        { label: "enum" },
    ]);
    return { typeKind };
}

async function pickTypeNameStep(
    input: MultiStepInput,
    values: { folderUri: Uri }
): Promise<{ typeName: string; fileUri: Uri }> {
    const typeName = await input.showInputBox();
    let fileUri = Uri.joinPath(values.folderUri, `${typeName}.cs`);

    if (await fileExists(fileUri)) {
        fileUri = await input.showSaveDialog();
    }

    return { typeName, fileUri };
}
