import TokenParser from '../../../core/parser/TokenParser';
import QualifiedName from '../../../core/entities/qualified_name/QualifiedName';
import TokenType from '../../../core/entities/token/TokenType';
import { operators } from '../../../core/entities/operator/operators/operators';
import Token from '../../../core/entities/token/Token';

export default class GenericTokenParser extends TokenParser {
    protected parseQualifiedName(): QualifiedName {
        const nameParts: string[] = [];
        nameParts.push(this.expectNextToken(TokenType.IDENTIFIER).text);

        while (this.peek()?.text === operators.namespaceAccess.literal) {
            this.expectNextToken(TokenType.OPERATOR, operators.namespaceAccess.literal);
            const part: Token = this.expectNextToken(TokenType.IDENTIFIER);
            nameParts.push(part.text);
        }

        return {
            name: nameParts[nameParts.length - 1],
            scope: nameParts.slice(0, nameParts.length - 1),
        };
    }

    protected skipBalancedParens(leftParenPosition: number): number {
        let depth: number = 0;
        let pointer: number = leftParenPosition;

        while (pointer < this.tokens.length) {
            const token = this.tokens[pointer];

            if (token.tokenType === TokenType.L_PAREN) depth++;
            if (token.tokenType === TokenType.R_PAREN) {
                depth--;
                if (depth === 0) return pointer + 1;
            }

            pointer++;
        }

        throw new Error('Unclosed parenthesis');
    }
}
