import Token from '../../core/entities/token/Token';
import TokenType from '../../core/entities/token/TokenType';
import { operators } from '../../core/entities/operator/operators/operators';
import TokenParser from '../../core/parser/TokenParser';
import OperatorType from '../../core/entities/operator/OperatorType';
import TypeExpressionType from '../../core/entities/ast/type/TypeExpressionType';
import ASTNodeType from '../../core/entities/ast/ASTNodeType';
import TypeExpression from '../../core/entities/ast/type/TypeExpression';
import { prefixTypeModifierLiteralsMap } from '../../core/entities/modifier/type/prefix/prefix_modifiers';
import { postfixTypeModifierLiteralsMap } from '../../core/entities/modifier/type/postfix/postfix_modifiers';
import PostfixTypeModifier from '../../core/entities/modifier/type/postfix/PostfixTypeModifier';
import PrefixTypeModifier from '../../core/entities/modifier/type/prefix/PrefixTypeModifier';

export default class TypeParser extends TokenParser {
    private isPostfixTypeModifier(token: Token | null): boolean {
        if (!token) return false;
        return postfixTypeModifierLiteralsMap[token.text] !== undefined;
    }

    private isPrefixTypeModifier(token: Token | null): boolean {
        if (!token) return false;
        return prefixTypeModifierLiteralsMap[token.text] !== undefined;
    }

    public parseType(): TypeExpression {
        // const ... A
        const prefixModifiers: PrefixTypeModifier[] = [];
        while (this.isPrefixTypeModifier(this.peek())) prefixModifiers.push(prefixTypeModifierLiteralsMap[this.nextOrThrow().text]); // TODO: Search 2 times; Refactor

        let typeToken = this.expect(TokenType.IDENT);

        // A<...>
        const typeParameters = [];
        if (this.peek()?.text === operators[OperatorType.LT].literal) {
            this.expect(TokenType.OPERATOR, operators[OperatorType.LT].literal); // Skip '<'

            while (true) {
                typeParameters.push(this.parseType());
                if (this.peek()?.text === operators[OperatorType.GT].literal) break;
                this.expect(TokenType.COMMA);
            }

            this.expect(TokenType.OPERATOR, operators[OperatorType.GT].literal); // Skip '>'
        }

        // A*
        const postfixModifiers: PostfixTypeModifier[] = [];
        while (this.isPostfixTypeModifier(this.peek())) postfixModifiers.push(postfixTypeModifierLiteralsMap[this.nextOrThrow().text]); // TODO: Search 2 times; Refactor

        return {
            nodeType: ASTNodeType.TYPE,
            type: TypeExpressionType.TYPE,
            typeName: typeToken.text,
            prefixModifiers: prefixModifiers,
            typeParameters: typeParameters,
            postfixModifiers: postfixModifiers,
        };
    }
}
