import { Token, TokenType } from './Token.js';

const KEYWORDS = {
    if: TokenType.IF,
    else: TokenType.ELSE,
    for: TokenType.FOR,
    while: TokenType.WHILE,
};

const OPERATORS = [
    '==',
    '!=',
    '<=',
    '>=',
    '&&',
    '||',
    '++',
    '--',
    '+',
    '-',
    '*',
    '/',
    '=',
    '<',
    '>',
    '&',
];

const SIGNS = [
    '(',
    ')',
    '{',
    '}',
    ';',
    ',',
    '.'
];

export default class Lexer {
    constructor(input) {
        this.input = input;
        this.position = 0;
    }

    step() {
        this.position++;
    }

    next() {
        this.step();
        return this.current();
    }

    current() {
        return this.position < this.input.length ? this.input[this.position] : null;
    }

    isLetter(c) {
        return /[a-zA-Z_]/.test(c);
    }
    isDigit(c) {
        return /[0-9]/.test(c);
    }

    tokenize() {
        const tokens = [];

        while (this.position < this.input.length) {
            this.skipWhitespaces();

            let current = this.current();
            if (current == null) break;

            if (this.isLetter(current)) {
                tokens.push(this.parseIdentifier());
                continue;
            }

            if (this.isDigit(current)) {
                tokens.push(this.parseNumber());
                continue;
            }

            const sign = this.searchForSign();
            if (sign) {
                this.position += sign.text.length;
                tokens.push(sign);
                continue;
            }

            const op = this.searchForOperator();
            if (op) {
                this.position += op.text.length;
                tokens.push(op);
                continue;
            }

            throw new Error(`Unexpected char: ${current}`);
        }

        tokens.push(new Token(TokenType.EOF, ''));
        return tokens;
    }

    searchForSign() {
        for (const sign of SIGNS) {
            if (this.input.startsWith(sign, this.position)) {
                return new Token(sign, sign);
            }
        }

        return null;
    }

    searchForOperator() {
        for (const op of OPERATORS) {
            if (this.input.startsWith(op, this.position)) {
                return new Token(TokenType.OP, op);
            }
        }

        return null;
    }

    skipWhitespaces() {
        let current = this.current();
        while (current != null && /\s/.test(current)) {
            current = this.next();
        }
    }

    parseIdentifier() {
        let start = this.position;

        let current = this.current();
        while (current != null && /[a-zA-Z0-9_]/.test(current)) {
            current = this.next();
        }

        const text = this.input.slice(start, this.position);
        const type = KEYWORDS[text] || TokenType.IDENT;

        return new Token(type, text);
    }

    parseNumber() {
        let start = this.position;

        let current = this.current();
        while (current != null && this.isDigit(current)) {
            current = this.next();
        }

        const text = this.input.slice(start, this.position);

        return new Token(TokenType.NUMBER, text);
    }
}
