import Token from '../../core/entities/token/Token';
import TokenType from '../../core/entities/token/TokenType';

export function createUnexpectedTokenErrorMessage(input: string, token: Token, expected?: { type: TokenType; text?: string }): string {
    const locationMessage = expected
        ? `Unexpected token ${token.text === '' ? '<empty>' : JSON.stringify(token.text)} (${String(token.tokenType)}). Expected: ${expected.type}${expected.text ? ` (${expected.text})` : ''}. At line ${token.line}, column ${token.inlinePosition}, global position ${token.globalPosition}.`
        : `Unexpected token ${token.text === '' ? '<empty>' : JSON.stringify(token.text)} (${String(token.tokenType)}) at line ${token.line}, column ${token.inlinePosition}, global position ${token.globalPosition}.`;

    const sourcePreview = createSourcePreview(input, token.line, token.inlinePosition, Math.max(token.text.length, 1));

    return `${locationMessage}\n${sourcePreview}`;
}

export function createUnexpectedCharErrorMessage(input: string, char: string, globalPosition: number, line: number, inlinePosition: number, expected?: string): string {
    const locationMessage = expected
        ? `Unexpected character ${char === '' ? '<empty>' : JSON.stringify(char)}. Expected: ${expected}. At line ${line}, column ${inlinePosition}, global position ${globalPosition}.`
        : `Unexpected character ${char === '' ? '<empty>' : JSON.stringify(char)} at line ${line}, column ${inlinePosition}, global position ${globalPosition}.`;

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
