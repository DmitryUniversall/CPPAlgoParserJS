import Token from '../../core/entities/token/Token';
import { operators } from '../../core/entities/operator/operators/operators';
import { keywords } from '../../core/entities/keyword/keywords/keywords';
import Keyword from '../../core/entities/keyword/Keyword';
import TokenParser from '../../core/parser/TokenParser';
import Expression from '../../core/entities/ast/expressions/Expression';
import ASTNodeType from '../../core/entities/ast/ASTNodeType';
import ExpressionType from '../../core/entities/ast/expressions/ExpressionType';
import TokenType from '../../core/entities/token/TokenType';
import { createUnexpectedTokenErrorMessage } from '../utils/errors';
import Operator from '../../core/entities/operator/Operator';
import TypeParser from './TypeParser';
import TypeExpression from '../../core/entities/ast/type/TypeExpression';
import TernaryExpression from '../../core/entities/ast/expressions/expressions/other/TernaryExpression';
import CallExpression from '../../core/entities/ast/expressions/expressions/other/CallExpression';
import IndexExpression from '../../core/entities/ast/expressions/expressions/other/IndexExpression';

const prefixOperators: Record<string, Operator> = Object.entries(operators).reduce((acc: Record<string, Operator>, [_, config]) => {
    if (config.prefix) acc[config.literal] = config;
    return acc;
}, {});

const infixOperators: Record<string, Operator> = Object.entries(operators).reduce((acc: Record<string, Operator>, [_, config]) => {
    if (config.infix) acc[config.literal] = config;
    return acc;
}, {});

const postfixOperators: Record<string, Operator> = Object.entries(operators).reduce((acc: Record<string, Operator>, [_, config]) => {
    if (config.postfix) acc[config.literal] = config;
    return acc;
}, {});

const keywordExpressionsMap: Record<string, Keyword> = [keywords.nullptr].reduce((acc: Record<string, Keyword>, keyword) => {
    acc[keyword.literal] = keyword;
    return acc;
}, {});

export default class PrattParser extends TokenParser {
    private isPostfix(token: Token | null) {
        if (!token) return false;
        return postfixOperators[token.text] !== undefined;
    }

    private isInfix(token: Token | null) {
        if (!token) return false;
        return infixOperators[token.text] !== undefined;
    }

    private parseTypeExpression(): TypeExpression {
        const typeParser = new TypeParser(this.source, this.tokens, this.position);
        return typeParser.parseType();
    }

    private parsePrefixExpression(token: Token): Expression {
        // *obj
        if (token.text === operators.star.literal) {
            return {
                nodeType: ASTNodeType.EXPRESSION,
                type: ExpressionType.DEREF_EXPRESSION,
                expr: this.parseExpression(prefixOperators[token.text].prefix!!.precedence),
            };
        }

        // &obj
        if (token.text === operators.ampersand.literal) {
            return {
                nodeType: ASTNodeType.EXPRESSION,
                type: ExpressionType.ADDRESS_EXPRESSION,
                expr: this.parseExpression(prefixOperators[token.text].prefix!!.precedence),
            };
        }

        // -obj
        if (token.text === operators.minus.literal) {
            return {
                nodeType: ASTNodeType.EXPRESSION,
                type: ExpressionType.NEGATE_EXPRESSION,
                expr: this.parseExpression(prefixOperators[token.text].prefix!!.precedence),
            };
        }

        // ++obj
        if (token.text === operators.inc.literal) {
            return {
                nodeType: ASTNodeType.EXPRESSION,
                type: ExpressionType.PREFIX_INCREMENT_EXPRESSION,
                expr: this.parseExpression(prefixOperators[token.text].prefix!!.precedence),
            };
        }

        // --obj
        if (token.text === operators.dec.literal) {
            return {
                nodeType: ASTNodeType.EXPRESSION,
                type: ExpressionType.PREFIX_INCREMENT_EXPRESSION,
                expr: this.parseExpression(prefixOperators[token.text].prefix!!.precedence),
            };
        }

        // new Obj<...>
        if (token.tokenType === TokenType.KEYWORD && token.text === keywords.new.literal) {
            const typeExpression = this.parseTypeExpression();

            return {
                nodeType: ASTNodeType.EXPRESSION,
                type: ExpressionType.NEW_EXPRESSION,
                typeExpr: typeExpression,
            };
        }

        // Keyword expression (nullptr)
        const keyword = keywordExpressionsMap[token.text];
        if (keyword !== undefined) {
            return {
                nodeType: ASTNodeType.EXPRESSION,
                type: ExpressionType.KEYWORD_EXPRESSION,
                keyword: keyword,
            };
        }

        // Identifier (obj)
        if (token.tokenType === TokenType.IDENT) {
            return {
                nodeType: ASTNodeType.EXPRESSION,
                type: ExpressionType.IDENT_EXPRESSION,
                identifier: token.text,
            };
        }

        // Number
        if (token.tokenType === TokenType.NUMBER) {
            return {
                nodeType: ASTNodeType.EXPRESSION,
                type: ExpressionType.NUMBER_EXPRESSION,
                number: token.text,
            };
        }

        // String literal ("obj")
        if (token.tokenType === TokenType.STRING_LITERAL) {
            return {
                nodeType: ASTNodeType.EXPRESSION,
                type: ExpressionType.STRING_LITERAL_EXPRESSION,
                literal: token.text,
            };
        }

        // (...)
        if (token.tokenType === TokenType.L_PAREN) {
            const expression = this.parseExpression();
            this.expect(TokenType.R_PAREN);
            return expression;
        }

        throw new Error(createUnexpectedTokenErrorMessage(this.source, token));
    }

    parseInfixExpression(left: Expression, token: Token, operator: Operator): Expression {
        const nextPrecedence = operator.infix!!.assoc === 'right' ? operator.infix!!.precedence - 1 : operator.infix!!.precedence;
        const right = this.parseExpression(nextPrecedence);

        // left += right
        if (token.text === operators.addAssign.literal) {
            return {
                nodeType: ASTNodeType.EXPRESSION,
                type: ExpressionType.ADD_ASSIGN_EXPRESSION,
                left: left,
                right: right,
            };
        }

        // left -= right
        if (token.text === operators.minusAssign.literal) {
            return {
                nodeType: ASTNodeType.EXPRESSION,
                type: ExpressionType.MINUS_ASSIGN_EXPRESSION,
                left: left,
                right: right,
            };
        }

        // left = right
        if (token.text === operators.assign.literal) {
            return {
                nodeType: ASTNodeType.EXPRESSION,
                type: ExpressionType.ASSIGNMENT_EXPRESSION,
                left: left,
                right: right,
            };
        }

        // left <op> right
        return {
            nodeType: ASTNodeType.EXPRESSION,
            type: ExpressionType.BINARY_OPERATION_EXPRESSION,
            operator: operator,
            left: left,
            right: right,
        };
    }

    parsePostfixExpression(left: Expression, token: Token): Expression {
        // left++
        if (token.text === operators.inc.literal) {
            return {
                nodeType: ASTNodeType.EXPRESSION,
                type: ExpressionType.POSTFIX_INCREMENT_EXPRESSION,
                expr: left,
            };
        }

        // left--
        if (token.text === operators.dec.literal) {
            return {
                nodeType: ASTNodeType.EXPRESSION,
                type: ExpressionType.POSTFIX_DECREMENT_EXPRESSION,
                expr: left,
            };
        }

        // left.X
        if (token.text === operators.dot.literal) {
            const memberName = this.expect(TokenType.IDENT);

            return {
                nodeType: ASTNodeType.EXPRESSION,
                type: ExpressionType.MEMBER_EXPRESSION,
                owner: left,
                field: memberName.text,
            };
        }

        // left->X
        if (token.text === operators.arrow.literal) {
            const memberName = this.expect(TokenType.IDENT);

            return {
                nodeType: ASTNodeType.EXPRESSION,
                type: ExpressionType.PTR_MEMBER_EXPRESSION,
                owner: left,
                field: memberName.text,
            };
        }

        if (token.text === operators.namespaceAccess.literal) {
            const name = this.expect(TokenType.IDENT);

            return {
                nodeType: ASTNodeType.EXPRESSION,
                type: ExpressionType.SCOPE_RESOLUTION_EXPRESSION,
                scope: left,
                field: name.text,
            };
        }

        throw new Error(createUnexpectedTokenErrorMessage(this.source, token));
    }

    private parseTernaryExpression(left: Expression): TernaryExpression {
        const thenExpression = this.parseExpression(operators.tern.infix!!.precedence - 1);
        this.expect(TokenType.COLON);
        const elseExpression = this.parseExpression(operators.tern.infix!!.precedence - 1);

        return {
            nodeType: ASTNodeType.EXPRESSION,
            type: ExpressionType.TERNARY_EXPRESSION,
            condition: left,
            thenExpr: thenExpression,
            elseExpr: elseExpression,
        };
    }

    private parseCallExpression(left: Expression): CallExpression {
        const args = [];

        if (this.peek()?.tokenType !== TokenType.R_PAREN) {
            while (true) {
                args.push(this.parseExpression());

                if (this.peek()?.tokenType !== TokenType.COMMA) break;
                this.nextOrThrow();
            }
        }

        this.expect(TokenType.R_PAREN);
        return {
            nodeType: ASTNodeType.EXPRESSION,
            type: ExpressionType.CALL_EXPRESSION,
            called: left,
            args: args,
        };
    }

    private parseIndex(left: Expression): IndexExpression {
        const expression = this.parseExpression();

        this.expect(TokenType.R_BRACKET);

        return {
            nodeType: ASTNodeType.EXPRESSION,
            type: ExpressionType.INDEX_EXPRESSION,
            owner: left,
            index: expression,
        };
    }

    parseExpression(minPrecedence = 0): Expression {
        let left = this.parsePrefixExpression(this.nextOrThrow());

        while (true) {
            let token = this.peek();
            if (token == null) break;

            if (this.isPostfix(token)) {
                const postfixPrecedence = postfixOperators[token.text].postfix!!.precedence;
                if (postfixPrecedence <= minPrecedence) break;

                token = this.nextOrThrow();
                left = this.parsePostfixExpression(left, token);
                continue;
            }

            if (token.tokenType === TokenType.L_PAREN) {
                const callPrecedence = 9;
                if (callPrecedence <= minPrecedence) break;

                this.nextOrThrow();
                left = this.parseCallExpression(left);
                continue;
            }

            if (token.tokenType === TokenType.L_BRACKET) {
                const indexPrecedence = 9;
                if (indexPrecedence <= minPrecedence) break;

                this.nextOrThrow();
                left = this.parseIndex(left);
                continue;
            }

            if (token.tokenType === TokenType.OPERATOR && token.text === operators.tern.literal) {
                const ternPrecedence = operators.tern.infix!!.precedence;
                if (ternPrecedence <= minPrecedence) break;

                this.nextOrThrow();
                left = this.parseTernaryExpression(left);
                continue;
            }

            if (!this.isInfix(token)) break;

            const operator: Operator = infixOperators[token.text];
            if (operator.infix!!.precedence <= minPrecedence) break;

            token = this.nextOrThrow();
            left = this.parseInfixExpression(left, token, operator);
        }

        return left;
    }
}
