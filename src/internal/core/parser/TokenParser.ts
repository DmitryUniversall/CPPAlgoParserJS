import Token from '../entities/token/Token';
import TokenType from '../entities/token/TokenType';
import { createUnexpectedTokenErrorMessage } from '../../main/utils/errors';
import CoreParser from './CoreParser';

export default class TokenParser extends CoreParser<Token> {
    protected get tokens(): Token[] {
        return this.items;
    }

    protected expectNextToken(tokenType: TokenType, text: string | null = null): Token {
        const next: Token = this.nextOrThrow();

        if (next.tokenType !== tokenType || (text !== null && next.text !== text))
            throw new Error(createUnexpectedTokenErrorMessage(this.source, next, { type: tokenType, text: text === null ? undefined : text }));

        return next;
    }
}
