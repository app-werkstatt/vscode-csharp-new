import { FileSystemError, Uri, workspace } from "vscode";
import { MultiStepInput } from "./multi-step-input";

export async function pickFileConfiguration(
    folderUri: Uri
): Promise<NewFileConfiguration | undefined> {
    return await MultiStepInput.from({
        folderUri,
        resolvedNamespace: undefined,
    })
        .addStep(pickTypeKindStep)
        .addStep(pickTypeNameStep)
        .addConditionalStep(pickFileUriStep, wouldOverwriteExistingFile)
        .run();
}

export interface NewFileConfiguration {
    fileUri: Uri;
    typeKind: string;
    typeName: string;
}

async function pickTypeKindStep(
    input: MultiStepInput
): Promise<{ typeKind: string }> {
    const typeKind = await input.showQuickPick([
        "class",
        "record",
        "interface",
        "struct",
        "record struct",
        "enum",
    ]);
    return { typeKind };
}

async function pickTypeNameStep(
    input: MultiStepInput,
    values: { folderUri: Uri }
): Promise<{ typeName: string; fileUri: Uri }> {
    const typeName = await input.showInputBox();
    const fileUri = Uri.joinPath(values.folderUri, `${typeName}.cs`);

    return { typeName, fileUri };
}

function pickFileUriStep(): Promise<{ fileUri: Uri }> {
    return Promise.reject();
}

async function wouldOverwriteExistingFile(state: {
    fileUri: Uri | undefined;
}): Promise<boolean> {
    if (!state.fileUri) {
        return false;
    }

    try {
        await workspace.fs.stat(state.fileUri);
        return true; // if we reach here, the file exists
    } catch (e) {
        if (e instanceof FileSystemError && e.code === "FileNotFound") {
            return false; // file was not found
        } else {
            return true; // some other error
        }
    }
}

// export class FileConfigurationPicker {
//     constructor(folderUri: Uri) {
//         this.folderUri = folderUri;
//     }

//     private readonly folderUri: Uri;

//     public async pick(): Promise<NewFileConfiguration | undefined> {
//         try {
//             return await this.pickTypeKind({
//                 totalSteps: 3,
//                 resolvedNamespace: undefined,
//             });
//         } catch (_) {
//             return undefined;
//         }
//     }

//     async pickTypeKind(
//         info: FlowInfo
//     ): Promise<NewFileConfiguration | undefined> {
//         const picker = window.createQuickPick();
//         picker.title = "Select type";
//         picker.items = [
//             { label: "class" },
//             { label: "record" },
//             { label: "interface" },
//             { label: "struct" },
//             { label: "record struct" },
//             { label: "enum" },
//         ];
//         picker.totalSteps = info.totalSteps;

//         return new Promise((resolve, reject) => {
//             reject(FlowAction.aborted);
//         });
//     }
// }

// interface FlowInfo {
//     readonly resolvedNamespace: string | undefined;
//     readonly totalSteps: number;
// }

// class FlowAction {
//     static aborted = new FlowAction();
//     static back = new FlowAction();
// }
