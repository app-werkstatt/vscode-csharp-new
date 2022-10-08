import {
    Disposable,
    InputBoxOptions,
    QuickInputButtons,
    QuickPickItem,
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
        const disposables: Disposable[] = [];

        try {
            return await new Promise((resolve, reject) => {
                const inputBox = window.createInputBox();
                inputBox.step = this.state.step;
                inputBox.totalSteps = this.state.totalSteps;

                inputBox.title = options?.title;
                inputBox.value = options?.value ?? "";
                inputBox.prompt = options?.prompt;
                inputBox.placeholder = options?.placeHolder;
                inputBox.password = options?.password ?? false;

                inputBox.ignoreFocusOut = options?.ignoreFocusOut ?? false;

                if (this.state.step > 1) {
                    inputBox.buttons = [QuickInputButtons.Back];
                }

                disposables.push(
                    inputBox.onDidAccept(() => {
                        resolve(inputBox.value);
                    }),
                    inputBox.onDidHide(() => {
                        reject(FlowAction.cancel);
                    }),
                    inputBox.onDidTriggerButton((button) => {
                        if (button === QuickInputButtons.Back) {
                            reject(FlowAction.back);
                        }
                    })
                );

                inputBox.show();
            });
        } finally {
            disposables.forEach((d) => d.dispose());
        }
    }

    public async showQuickPick<T extends QuickPickItem>(
        items: readonly T[] | Thenable<readonly T[]>,
        options?: QuickPickOptions
    ): Promise<T> {
        const loadedItems = Array.isArray(items)
            ? (items as readonly T[])
            : await (items as Thenable<readonly T[]>);

        const disposables: Disposable[] = [];

        try {
            return await new Promise((resolve, reject) => {
                const quickPick = window.createQuickPick<T>();
                quickPick.step = this.state.step;
                quickPick.totalSteps = this.state.totalSteps;

                quickPick.items = loadedItems;
                quickPick.title = options?.title;
                quickPick.matchOnDescription =
                    options?.matchOnDescription ?? false;
                quickPick.matchOnDetail = options?.matchOnDetail ?? false;
                quickPick.placeholder = options?.placeHolder;
                quickPick.ignoreFocusOut = options?.ignoreFocusOut ?? false;

                if (this.state.step > 1) {
                    quickPick.buttons = [QuickInputButtons.Back];
                }

                disposables.push(
                    quickPick.onDidChangeSelection((items) => {
                        resolve(items[0]);
                    }),
                    quickPick.onDidHide(() => {
                        reject(FlowAction.cancel);
                    }),
                    quickPick.onDidTriggerButton((button) => {
                        if (button === QuickInputButtons.Back) {
                            reject(FlowAction.back);
                        }
                    })
                );

                quickPick.show();
            });
        } finally {
            disposables.forEach((d) => d.dispose());
        }
    }

    public async showSaveDialog(options?: SaveDialogOptions): Promise<Uri> {
        const result = await window.showSaveDialog(options);
        if (result === undefined) {
            throw FlowAction.cancel;
        }

        return result;
    }

    state: { step: number; totalSteps: number } = { step: 0, totalSteps: 0 };
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
        const newStep = {
            run: async (input: MultiStepInput, values: unknown) => {
                const typedValues = values as TIn;
                return { ...typedValues, ...(await step(input, typedValues)) };
            },
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
        const state: unknown[] = [start];

        while (state.length <= this.steps.length) {
            const step = state.length;
            const totalSteps = this.steps.length;

            try {
                this.input.state = { step, totalSteps };
                const newState = await this.steps[step - 1].run(
                    this.input,
                    state[state.length - 1]
                );

                state.push(newState);
            } catch (e) {
                if (e === FlowAction.cancel) {
                    return undefined;
                } else if (e === FlowAction.back) {
                    state.pop();
                } else {
                    throw e;
                }
            }
        }

        return state[state.length - 1] as TEnd;
    }
}

interface InputStep {
    run: (input: MultiStepInput, values: unknown) => Promise<unknown>;
}

class FlowAction {
    static cancel = new FlowAction();
    static back = new FlowAction();
}
