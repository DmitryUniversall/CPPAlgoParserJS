import Token from '../entities/token/Token';
import TokenType from '../entities/token/TokenType';
import { createUnexpectedTokenErrorMessage } from '../../main/utils/errors';

export default class TokenParser {
    protected readonly tokens: Token[];
    protected readonly source: string;
    protected position: number;

    constructor(source: string, tokens: Token[], startPosition: number) {
        this.tokens = tokens;
        this.source = source;
        this.position = startPosition;
    }

    protected hasNext(): boolean {
        return this.position < this.tokens.length;
    }

    protected peek(): Token | null {
        return this.hasNext() ? this.tokens[this.position] : null;
    }

    protected peekOrThrow(): Token {
        if (!this.hasNext()) throw new Error('Next token is required, but was not found (end of file)');
        return this.peek()!!;
    }

    protected next(): Token | null {
        return this.hasNext() ? this.tokens[this.position++] : null;
    }

    protected nextOrThrow(): Token {
        if (!this.hasNext()) throw new Error('Next token is required, but was not found (end of file)');
        return this.next()!!;
    }

    protected expect(tokenType: TokenType, text: string | null = null): Token {
        const next: Token = this.nextOrThrow();

        if (next.tokenType !== tokenType || (text !== null && next.text !== text))
            throw new Error(createUnexpectedTokenErrorMessage(this.source, next, { type: tokenType, text: text === null ? undefined : JSON.stringify(text) }));

        return next;
    }
}
