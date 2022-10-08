import {
    InputBoxOptions,
    QuickPickOptions,
    SaveDialogOptions,
    Uri,
    window,
} from "vscode";

export class MultiStepInput {
    public static from<TIn>(input: TIn): MultiStepInputBuilder<TIn, TIn> {
        return new MultiStepInputBuilder(new MultiStepInput(), input, []);
    }

    public async showInputBox(options?: InputBoxOptions): Promise<string> {
        const result = await window.showInputBox(options);
        if (result === undefined) {
            throw FlowAction.aborted;
        }

        return result;
    }

    public async showQuickPick(
        items: readonly string[] | Thenable<readonly string[]>,
        options?: QuickPickOptions
    ): Promise<string> {
        const result = await window.showQuickPick(items, options);
        if (result === undefined) {
            throw FlowAction.aborted;
        }

        return result;
    }

    public async showSaveDialog(options?: SaveDialogOptions): Promise<Uri> {
        const result = await window.showSaveDialog(options);
        if (result === undefined) {
            throw FlowAction.aborted;
        }

        return result;
    }
}

class MultiStepInputBuilder<TStart, TIn> {
    constructor(input: MultiStepInput, start: TStart, steps: InputStep[]) {
        this.input = input;
        this.start = start;
        this.steps = steps;
    }

    private readonly input: MultiStepInput;
    private readonly start: TStart;
    private readonly steps: InputStep[];

    public addStep<TOut>(
        step: (input: MultiStepInput, values: TIn) => Promise<TOut>
    ): MultiStepInputBuilder<TStart, TIn & TOut> {
        return this.addStepInternal(step, undefined);
    }

    public addConditionalStep<TOut>(
        step: (input: MultiStepInput, values: TIn) => Promise<TOut>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        condition: (state: any) => Promise<boolean>
    ): MultiStepInputBuilder<TStart, TIn & TOut> {
        return this.addStepInternal(step, condition);
    }

    private addStepInternal<TOut>(
        step: (input: MultiStepInput, values: TIn) => Promise<TOut>,
        condition: ((state: unknown) => Promise<boolean>) | undefined
    ): MultiStepInputBuilder<TStart, TIn & TOut> {
        const newStep = {
            run: async (input: MultiStepInput, values: unknown) => {
                const typedValues = values as TIn;
                return { ...typedValues, ...(await step(input, typedValues)) };
            },
            condition,
        };

        return new MultiStepInputBuilder<TStart, TIn & TOut>(
            this.input,
            this.start,
            [...this.steps, newStep]
        );
    }

    public async run(): Promise<TIn | undefined> {
        return await new MultiStepRunner<TStart, TIn>(
            this.input,
            this.steps
        ).run(this.start);
    }
}

class MultiStepRunner<TStart, TEnd> {
    constructor(input: MultiStepInput, steps: InputStep[]) {
        this.input = input;
        this.steps = steps;
    }

    private readonly input: MultiStepInput;
    private readonly steps: InputStep[];

    async run(start: TStart): Promise<TEnd | undefined> {
        throw "Not implemented";
    }
}

interface InputStep {
    condition: ((state: unknown) => Promise<boolean>) | undefined;
    run: (input: MultiStepInput, values: unknown) => Promise<unknown>;
}

class FlowAction {
    static aborted = new FlowAction();
    static back = new FlowAction();
}
