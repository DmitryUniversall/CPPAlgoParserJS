import Token from '../entities/token/Token';

export function createUnexpectedTokenErrorMessage(token: Token, expected?: Token): string {
    const renderedText = token.text === '' ? '<empty>' : JSON.stringify(token.text);

    const tokenTypeName = String(token.tokenType);

    return expected
        ? `Unexpected token ${renderedText} (${tokenTypeName}). Expected: ${expected}. At line ${token.line}, column ${token.inlinePosition}, global position ${token.globalPosition}.`
        : `Unexpected token ${renderedText} (${tokenTypeName}) at line ${token.line}, column ${token.inlinePosition}, global position ${token.globalPosition}.`;
}

export function createUnexpectedCharErrorMessage(char: string, globalPosition: number, line: number, inlinePosition: number, expected?: string): string {
    const renderedText = char === '' ? '<empty>' : JSON.stringify(char);

    return expected
        ? `Unexpected character ${renderedText}. Expected: ${expected}. At line ${line}, column ${inlinePosition}, global position ${globalPosition}.`
        : `Unexpected character ${renderedText} at line ${line}, column ${inlinePosition}, global position ${globalPosition}.`;
}
