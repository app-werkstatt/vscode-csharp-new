import * as Parsimmon from "parsimmon";

export interface TypeName {
    readonly identifier: string;
    readonly typeParams: string[];
}

export type ParseResult<T> =
    | { success: true; result: T }
    | { success: false; error: string };

export function parseTypeName(name: string): ParseResult<TypeName> {
    const result = typeName.parse(name);

    if (result.status === true) {
        const [identifier, typeParams] = result.value;
        const typeName = { identifier, typeParams };
        return { success: true, result: typeName };
    } else {
        const { index, expected } = result;
        const expectation =
            expected.length > 1
                ? `Expected one of the following: ${expected.join("; ")}`
                : `Expected ${expected[0]}`;

        const error = `Invalid character at position ${index.column}. ${expectation}`;
        return { success: false, error };
    }
}

const comma = Parsimmon.string(",");
const brOpen = Parsimmon.string("<");
const brClose = Parsimmon.string(">");
const ident = Parsimmon.regexp(/[a-zA-Z_][a-zA-Z0-9_]*/).desc("an identifier");

const paramList = ident
    .trim(Parsimmon.optWhitespace)
    .sepBy1(comma)
    .wrap(brOpen, brClose);

const typeName = Parsimmon.seq(
    ident,
    paramList.atMost(1).map((pls) => (pls.length > 0 ? pls[0] : []))
).trim(Parsimmon.optWhitespace);
