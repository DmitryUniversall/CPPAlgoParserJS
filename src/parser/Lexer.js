import { Token, TokenType } from './Token.js';

const KEYWORDS = {
    if: TokenType.IF,
    else: TokenType.ELSE,
    for: TokenType.FOR,
    while: TokenType.WHILE,
    delete: TokenType.DELETE,
    nullptr: TokenType.NULLPTR,
};

const OPERATORS = ['->', '==', '!=', '<=', '>=', '&&', '||', '++', '--', '+', '-', '*', '/', '=', '<', '>', '&'].sort((a, b) => b.length - a.length);
const SIGN_TOKENS = [
    TokenType.L_PAREN,
    TokenType.R_PAREN,
    TokenType.L_BRACE,
    TokenType.R_BRACE,
    TokenType.SEMI,
    TokenType.COMMA,
    TokenType.L_BRACKET,
    TokenType.R_BRACKET,
];

export default class Lexer {
    constructor(input) {
        this.input = input;
        this.position = 0;
    }

    peek() {
        return this.position < this.input.length ? this.input[this.position] : null;
    }

    next() {
        return this.position < this.input.length ? this.input[this.position++] : null;
    }

    isWhitespace(c) {
        if (!c) return false;
        return /\s/.test(c);
    }

    isLetter(c) {
        if (!c) return false;
        return /[a-zA-Z_]/.test(c);
    }

    isDigit(c) {
        if (!c) return false;
        return /[0-9]/.test(c);
    }

    isDigitOrLetter(c) {
        if (!c) return false;
        return /[a-zA-Z0-9_]/.test(c);
    }

    isStartOfStringLiteral(c) {
        if (!c) return false;
        return c === '"';
    }

    tokenize() {
        const tokens = [];

        while (this.position < this.input.length) {
            this.skipWhitespaces();

            let char = this.peek();
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

            const signToken = this.searchForSignToken();
            if (signToken) {
                this.position += signToken.text.length;
                tokens.push(signToken);
                continue;
            }

            const op = this.searchForOperator();
            if (op) {
                this.position += op.text.length;
                tokens.push(op);
                continue;
            }

            throw new Error(`Unexpected char: '${char}'`);
        }

        tokens.push(new Token(TokenType.EOF, ''));
        return tokens;
    }

    searchForSignToken() {
        for (const sign of SIGN_TOKENS) {
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
        while (this.isWhitespace(this.peek())) this.next();
    }

    parseStringLiteral() {
        this.next(); // Skip '"'

        let result = '';
        while (true) {
            let current = this.next();
            if (current === null || current === '"') break;

            if (current === '\\') {
                const next = this.next();
                if (next === 'n') result += '\n';
                else if (next === 't') result += '\t';
                else result += next;
            } else {
                result += current;
            }
        }

        return new Token(TokenType.STRING_LITERAL, result);
    }

    parseIdentifier() {
        let start = this.position;

        while (this.isDigitOrLetter(this.peek())) this.next();

        const text = this.input.slice(start, this.position);
        const type = KEYWORDS[text] || TokenType.IDENT;

        return new Token(type, text);
    }

    parseNumber() {
        let start = this.position;

        while (this.isDigit(this.peek())) this.next();

        const text = this.input.slice(start, this.position);

        return new Token(TokenType.NUMBER, text);
    }
}
