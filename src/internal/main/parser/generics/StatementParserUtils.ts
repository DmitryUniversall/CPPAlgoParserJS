import TokenParser from '../../../core/parser/TokenParser';
import Token from '../../../core/entities/token/Token';
import TypeExpression from '../../../core/entities/ast/type/TypeExpression';
import TypeParser from '../TypeParser';
import Expression from '../../../core/entities/ast/expressions/Expression';
import PrattParser from '../PrattParser';
import TokenType from '../../../core/entities/token/TokenType';
import { operators } from '../../../core/entities/operator/operators/operators';
import TypeLookAheadResult from '../entities/TypeLookAheadResult';
import TypedConstructLookAheadResult from '../entities/TypedConstructLookAheadResult';
import TypedConstructKind from '../entities/TypedConstructKind';
import { createUnexpectedTokenErrorMessage } from '../../utils/errors';
import QualifiedName from '../../../core/entities/qualified_name/QualifiedName';

export default class StatementParserUtils extends TokenParser {
    protected parseTypeExpression(): TypeExpression {
        const parser = new TypeParser(this.source, this.tokens, this.position);
        const result: TypeExpression = parser.parseTypeExpression();
        this.position = parser.currentPosition;
        return result;
    }

    protected parseTypeParameters(): TypeExpression[] {
        const parser = new TypeParser(this.source, this.tokens, this.position);
        const result: TypeExpression[] = parser.parseTypeParameters();
        this.position = parser.currentPosition;
        return result;
    }

    protected parseExpression(): Expression {
        const parser = new PrattParser(this.source, this.tokens, this.position);
        const result: Expression = parser.parseExpression();
        this.position = parser.currentPosition;
        return result;
    }

    protected typeLookAhead(): TypeLookAheadResult {
        const parser = new TypeParser(this.source, this.tokens, this.position);
        const typeExpression: TypeExpression = parser.parseTypeExpression();

        return {
            typeExpression: typeExpression,
            endPosition: parser.currentPosition,
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

    protected lookAheadTypedConstruct(): TypedConstructLookAheadResult {
        let pointer: number = this.position;

        try {
            const { endPosition } = this.typeLookAhead();
            pointer = endPosition;
        } catch {
            return { kind: TypedConstructKind.NONE };
        }

        if (this.tokens[pointer]?.tokenType !== TokenType.IDENTIFIER) return { kind: TypedConstructKind.NONE };

        pointer++;

        while (this.tokens[pointer]?.text === operators.namespaceAccess.literal) {
            pointer++; // Skip '::'

            // Identifier always expected after '::'
            if (this.tokens[pointer]?.tokenType !== TokenType.IDENTIFIER)
                throw Error(createUnexpectedTokenErrorMessage(this.source, this.tokens[pointer], { type: TokenType.IDENTIFIER }));

            pointer++; // Skip identifier
        }

        const nextToken: Token = this.tokens[pointer];
        if (!nextToken) return { kind: TypedConstructKind.NONE };

        // Type name(...)
        if (nextToken.tokenType === TokenType.L_PAREN) {
            pointer = this.skipBalancedParens(pointer);

            const afterParen: Token = this.tokens[pointer];
            if (!afterParen) return { kind: TypedConstructKind.NONE };

            // Type x(args) { ... }
            if (afterParen.tokenType === TokenType.L_BRACE) return { kind: TypedConstructKind.FUNCTION_DEFINITION };

            // Type x(args);
            return { kind: TypedConstructKind.VARIABLE_DECLARATION };
        }

        if (
            nextToken.tokenType === TokenType.SEMI ||
            nextToken.tokenType === TokenType.COMMA ||
            nextToken.tokenType === TokenType.L_BRACKET ||
            (nextToken.tokenType === TokenType.OPERATOR && nextToken.text === operators.assign.literal)
        ) {
            return { kind: TypedConstructKind.VARIABLE_DECLARATION };
        }

        return { kind: TypedConstructKind.NONE };
    }

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
}
