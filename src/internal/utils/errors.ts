import Token from '../entities/token/Token';

export function createUnexpectedTokenErrorMessage(input: string, token: Token, expected?: Token): string {
    const renderedText = token.text === '' ? '<empty>' : JSON.stringify(token.text);
    const tokenTypeName = String(token.tokenType);

    const locationMessage = expected
        ? `Unexpected token ${renderedText} (${tokenTypeName}). Expected: ${expected}. At line ${token.line}, column ${token.inlinePosition}, global position ${token.globalPosition}.`
        : `Unexpected token ${renderedText} (${tokenTypeName}) at line ${token.line}, column ${token.inlinePosition}, global position ${token.globalPosition}.`;

    const sourcePreview = createSourcePreview(input, token.line, token.inlinePosition, Math.max(token.text.length, 1));

    return `${locationMessage}\n${sourcePreview}`;
}

export function createUnexpectedCharErrorMessage(input: string, char: string, globalPosition: number, line: number, inlinePosition: number, expected?: string): string {
    const renderedText = char === '' ? '<empty>' : JSON.stringify(char);

    const locationMessage = expected
        ? `Unexpected character ${renderedText}. Expected: ${expected}. At line ${line}, column ${inlinePosition}, global position ${globalPosition}.`
        : `Unexpected character ${renderedText} at line ${line}, column ${inlinePosition}, global position ${globalPosition}.`;

    const sourcePreview = createSourcePreview(input, line, inlinePosition, 1);

    return `${locationMessage}\n${sourcePreview}`;
}

function createSourcePreview(input: string, line: number, inlinePosition: number, markerLength: number = 1): string {
    const lines = input.split(/\r?\n/);

    const sourceLine = lines[line] ?? '';

    const safeColumn = Math.max(inlinePosition, 0);
    const safeMarkerLength = Math.max(markerLength, 1);

    let markerLine: string;

    if (safeMarkerLength === 1) {
        markerLine = `${' '.repeat(safeColumn)}^`;
    } else {
        const leftTildes = Math.floor((safeMarkerLength - 1) / 2);
        const rightTildes = safeMarkerLength - 1 - leftTildes;

        markerLine = `${' '.repeat(Math.max(safeColumn - leftTildes, 0))}` + `${'~'.repeat(leftTildes)}^${'~'.repeat(rightTildes)}`;
    }

    return `${sourceLine}\n${markerLine}`;
}
