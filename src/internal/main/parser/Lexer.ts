import { operatorLiteralsMap } from '../../core/entities/operator/operators/operators';
import TokenType from '../../core/entities/token/TokenType';
import Token from '../../core/entities/token/Token';
import { createUnexpectedCharErrorMessage } from '../utils/errors';
import { keywordLiteralsMap } from '../../core/entities/keyword/keywords/keywords';

const operatorLiterals = Object.keys(operatorLiteralsMap).sort((a, b) => b.length - a.length);
const singleTokenTypes = [TokenType.L_PAREN, TokenType.R_PAREN, TokenType.L_BRACE, TokenType.R_BRACE, TokenType.COLON, TokenType.SEMI, TokenType.COMMA, TokenType.L_BRACKET, TokenType.R_BRACKET];

class LexerPositionState {
    public globalPosition: number;
    public line: number;
    public inlinePosition: number;

    constructor() {
        this.globalPosition = 0;
        this.line = 0;
        this.inlinePosition = 0;
    }
}

export default class Lexer {
    private readonly source: string;

    private readonly position: LexerPositionState;

    public constructor(input: string) {
        this.source = input;
        this.position = new LexerPositionState();
    }

    private hasNext(): boolean {
        return this.position.globalPosition < this.source.length;
    }

    private peek(): string | null {
        return this.hasNext() ? this.source[this.position.globalPosition] : null;
    }

    private next(): string | null {
        const nextChar: string | null = this.peek();
        if (nextChar === null) return null;

        this.advance();

        return nextChar;
    }

    private advance(count = 1): void {
        for (let i: number = 0; i < count; i++) {
            const char: string = this.source[this.position.globalPosition];
            if (char == null) return;

            this.position.globalPosition++;

            if (char === '\n') {
                this.position.line++;
                this.position.inlinePosition = 0;
            } else {
                this.position.inlinePosition++;
            }
        }
    }

    private expect(char: string): string {
        const globalPositionBefore: number = this.position.globalPosition;
        const lineBefore: number = this.position.line;
        const inlinePositionBefore: number = this.position.inlinePosition;

        const nextChar = this.next();

        if (nextChar !== char) {
            throw new Error(createUnexpectedCharErrorMessage(this.source, nextChar ?? '<EOF>', globalPositionBefore, lineBefore, inlinePositionBefore, char));
        }

        return nextChar;
    }

    private isWhitespace(char: string | null): boolean {
        if (!char) return false;
        return /\s/.test(char);
    }

    private isLetter(char: string | null): boolean {
        if (!char) return false;
        return /[a-zA-Z_]/.test(char);
    }

    private isDigit(char: string | null): boolean {
        if (!char) return false;
        return /[0-9]/.test(char);
    }

    private isDigitOrLetter(char: string | null): boolean {
        if (!char) return false;
        return /[a-zA-Z0-9_]/.test(char);
    }

    private isStartOfStringLiteral(char: string | null): boolean {
        if (!char) return false;
        return char === '"';
    }

    private skipWhitespaces() {
        while (this.isWhitespace(this.peek())) this.next();
    }

    private searchForSingleToken(): Token | null {
        for (const tokenType of singleTokenTypes) {
            if (this.source.startsWith(tokenType, this.position.globalPosition)) {
                return {
                    globalPosition: this.position.globalPosition,
                    line: this.position.line,
                    inlinePosition: this.position.inlinePosition,
                    text: tokenType,
                    tokenType: tokenType,
                };
            }
        }

        return null;
    }

    private searchForOperator(): Token | null {
        for (const operatorLiteral of operatorLiterals) {
            if (this.source.startsWith(operatorLiteral, this.position.globalPosition)) {
                return {
                    globalPosition: this.position.globalPosition,
                    line: this.position.line,
                    inlinePosition: this.position.inlinePosition,
                    text: operatorLiteral,
                    tokenType: TokenType.OPERATOR,
                };
            }
        }

        return null;
    }

    private parseStringLiteral(): Token {
        const startGlobalPosition: number = this.position.globalPosition;
        const startLine: number = this.position.line;
        const startInlinePosition: number = this.position.inlinePosition;

        this.expect('"');

        let result: string = '';
        while (true) {
            let current: string | null = this.next();
            if (current === null || current === '"') break;

            if (current === '\\') {
                const next: string | null = this.next();
                if (next === 'n') result += '\n';
                else if (next === 't') result += '\t';
                else result += next;
            } else {
                result += current;
            }
        }

        return {
            globalPosition: startGlobalPosition,
            line: startLine,
            inlinePosition: startInlinePosition,
            text: result,
            tokenType: TokenType.STRING_LITERAL,
        };
    }

    private parseIdentifier(): Token {
        const startGlobalPosition: number = this.position.globalPosition;
        const startLine: number = this.position.line;
        const startInlinePosition: number = this.position.inlinePosition;

        while (this.isDigitOrLetter(this.peek())) this.next();

        const identifier: string = this.source.slice(startGlobalPosition, this.position.globalPosition);

        return {
            globalPosition: startGlobalPosition,
            line: startLine,
            inlinePosition: startInlinePosition,
            text: identifier,
            tokenType: keywordLiteralsMap[identifier] !== undefined ? TokenType.KEYWORD : TokenType.IDENTIFIER,
        };
    }

    private parseNumber(): Token {
        const startGlobalPosition: number = this.position.globalPosition;
        const startLine: number = this.position.line;
        const startInlinePosition: number = this.position.inlinePosition;

        while (this.isDigit(this.peek())) this.next();

        const number: string = this.source.slice(startGlobalPosition, this.position.globalPosition);

        return {
            globalPosition: startGlobalPosition,
            line: startLine,
            inlinePosition: startInlinePosition,
            text: number,
            tokenType: TokenType.NUMBER,
        };
    }

    public tokenize(): Token[] {
        const tokens: Token[] = [];

        while (this.hasNext()) {
            this.skipWhitespaces();

            let char: string | null = this.peek();
            if (char == null) break;

            if (this.isLetter(char)) {
                tokens.push(this.parseIdentifier());
                continue;
            }

            if (this.isDigit(char)) {
                tokens.push(this.parseNumber());
                continue;
            }

            if (this.isStartOfStringLiteral(char)) {
                tokens.push(this.parseStringLiteral());
                continue;
            }

            const operatorToken: Token | null = this.searchForOperator();
            if (operatorToken) {
                this.advance(operatorToken.text.length);
                tokens.push(operatorToken);
                continue;
            }

            const singleToken: Token | null = this.searchForSingleToken();
            if (singleToken) {
                this.advance(singleToken.text.length);
                tokens.push(singleToken);
                continue;
            }

            throw new Error(
                createUnexpectedCharErrorMessage(this.source, char ?? '<EOF>', this.position.globalPosition, this.position.line, this.position.inlinePosition),
            );
        }

        tokens.push({
            globalPosition: this.position.globalPosition,
            line: this.position.line,
            inlinePosition: this.position.inlinePosition,
            text: '',
            tokenType: TokenType.EOF,
        });

        return tokens;
    }
}
