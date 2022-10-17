import * as vscode from "vscode";
import {
    Namespace,
    pickFileConfiguration,
    TypeDeclaration,
} from "../pickers/file-configuration";
import { SnippetWriter } from "../util/snippet-writer";

export async function newFile(uri: vscode.Uri) {
    const config = await pickFileConfiguration(uri);
    if (!config) {
        console.info("Create new file aborted");
        return;
    }

    await vscode.workspace.fs.writeFile(config.fileUri, new Uint8Array());

    const document = await vscode.workspace.openTextDocument(config.fileUri);
    const editor = await vscode.window.showTextDocument(document);

    const writer = new SnippetWriter();
    writeNamespace(writer, config.namespace, (writer) =>
        writeTypeDeclaration(writer, config.type)
    );

    editor.insertSnippet(writer.snippet);
}

function writeNamespace(
    writer: SnippetWriter,
    namespace: Namespace | undefined,
    content: (writer: SnippetWriter) => void
) {
    if (namespace === undefined) {
        content(writer);
        return;
    }

    writer.appendText(`namespace ${namespace.name}`);

    if (namespace.scope === "file") {
        writer.appendText(";").appendLineBreak().appendLineBreak();
        content(writer);
    } else {
        writer.appendText(" {").appendLineBreak().appendLineBreak();
        writer.increaseIndentation();
        content(writer);
        writer.decreaseIndentation();
        writer.appendText("}").appendLineBreak();
    }
}

function writeTypeDeclaration(writer: SnippetWriter, type: TypeDeclaration) {
    for (const attribute of type.attributes) {
        writer.appendText(`[${attribute}]`).appendLineBreak();
    }
    writer
        .appendChoice(["public", "internal"])
        .appendText(` ${type.keyword} ${type.name}`);

    if (type.style === "primary") {
        writer
            .appendText("(")
            .appendTabstop(0)
            .appendText(");")
            .appendLineBreak();
    } else {
        writer.appendText(" {").appendLineBreak().appendLineBreak();
        writer.increaseIndentation();
        writer.appendTabstop(0).appendLineBreak();
        writer.decreaseIndentation();
        writer.appendText("}").appendLineBreak();
    }
}
