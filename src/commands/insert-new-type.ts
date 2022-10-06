import { SnippetString, TextEditor, TextEditorEdit } from "vscode";

export function insertNewType(textEditor: TextEditor, edit: TextEditorEdit) {
    console.log("Insert new type...");

    const snippet = new SnippetString("${1|public,internal,protected,private|} class ${2:Foo} {\n\t$0\n}");
    textEditor.insertSnippet(snippet, textEditor.selection.active);

    // for (const selection of textEditor.selections) {
    //     edit.insert(selection.active, "class Foo {}");
    // }
}