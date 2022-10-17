import * as vscode from "vscode";

export class SnippetWriter {
    readonly snippet: vscode.SnippetString = new vscode.SnippetString();
    private indentationLevel = 0;
    private startOfLine = false;

    public increaseIndentation() {
        this.indentationLevel += 1;
    }

    public decreaseIndentation() {
        if (this.indentationLevel === 0) {
            throw new Error("Decreasing indentation below 0");
        }

        this.indentationLevel -= 1;
    }

    public appendText(text: string): SnippetWriter {
        if (text.length === 0) {
            return this;
        }

        this.appendIndentationIfNeeded();
        this.snippet.appendText(text);
        return this;
    }

    public appendLineBreak(): SnippetWriter {
        this.snippet.appendText("\n");
        this.startOfLine = true;
        return this;
    }

    public appendChoice(
        values: readonly string[],
        number?: number
    ): SnippetWriter {
        this.appendIndentationIfNeeded();
        this.snippet.appendChoice(values, number);
        return this;
    }

    public appendTabstop(number?: number): SnippetWriter {
        this.appendIndentationIfNeeded();
        this.snippet.appendTabstop(number);
        return this;
    }

    private appendIndentationIfNeeded() {
        if (!this.startOfLine) {
            return;
        }

        for (let index = 0; index < this.indentationLevel; index++) {
            this.snippet.appendText("\t");
        }
        this.startOfLine = false;
    }
}
