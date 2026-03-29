import { TokenType } from './Token.js';
import { OPERATORS } from './lexer/operators.js';
import { keywordLiteralsMap, KEYWORDS } from './lexer/keywords.js';

const PREFIX_OPERATORS = Object.entries(OPERATORS).reduce((acc, [_, config]) => {
    if (config.prefix) acc[config.literal] = config.prefix;
    return acc;
}, {});

const INFIX_OPERATORS = Object.entries(OPERATORS).reduce((acc, [_, config]) => {
    if (config.infix) acc[config.literal] = config.infix;
    return acc;
}, {});

const POSTFIX_OPERATORS = Object.entries(OPERATORS).reduce((acc, [_, config]) => {
    if (config.postfix) acc[config.literal] = config.postfix;
    return acc;
}, {});

export class PrattParser {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
    }

    peek() {
        return this.position < this.tokens.length ? this.tokens[this.position] : null;
    }

    next(required = false) {
        if (this.position >= this.tokens.length && required) throw new Error('Next token is required, but was not found');
        return this.position < this.tokens.length ? this.tokens[this.position++] : null;
    }

    expect(type, text = null) {
        const next = this.next();

        if (!next) throw new Error(`Expected token: "${type}" (${text ?? 'Any'}), but nothing was found`);
        if (next.type !== type) throw new Error(`Expected type ${type}, got ${next.type} (${next.text})`);
        if (text !== null && next.text !== text) throw new Error(`Expected '${text}', got '${next.text}'`);

        return next;
    }

    isPostfix(token) {
        return POSTFIX_OPERATORS[token.text] !== undefined;
    }

    isInfix(token) {
        return INFIX_OPERATORS[token.text] !== undefined;
    }

    getPostfixPrecedence() {
        return 9;
    }

    parseExpression(minPrecedence = 0) {
        let left = this.parsePrefix(this.next(true));

        while (true) {
            let token = this.peek();

            if (this.isPostfix(token)) {
                const postfixPrecedence = POSTFIX_OPERATORS[token.text].precedence;
                if (postfixPrecedence <= minPrecedence) break;

                token = this.next(true);
                left = this.parsePostfix(left, token);
                continue;
            }

            if (token.type === TokenType.L_PAREN) {
                const callPrecedence = this.getPostfixPrecedence();
                if (callPrecedence <= minPrecedence) break;

                this.next(true);
                left = this.parseCall(left);
                continue;
            }

            if (token.type === TokenType.L_BRACKET) {
                const indexPrecedence = this.getPostfixPrecedence();
                if (indexPrecedence <= minPrecedence) break;

                this.next(true);
                left = this.parseIndex(left);
                continue;
            }

            if (!this.isInfix(token)) break;

            const infixInfo = INFIX_OPERATORS[token.text];
            if (infixInfo.precedence <= minPrecedence) break;

            token = this.next(true);
            left = this.parseInfix(left, token, infixInfo);
        }

        return left;
    }

    parseCall(left) {
        const args = [];

        if (this.peek()?.type !== TokenType.R_PAREN) {
            while (true) {
                args.push(this.parseExpression());

                if (this.peek()?.type !== TokenType.COMMA) break;
                this.next(true);
            }
        }

        this.expect(TokenType.R_PAREN);
        return {
            nodeType: 'EXPRESSION',
            type: 'CALL_EXPRESSION',
            called: left,
            args: args,
        };
    }

    parseIndex(left) {
        const expression = this.parseExpression();

        this.expect(TokenType.R_BRACKET);

        return {
            nodeType: 'EXPRESSION',
            type: 'INDEX_EXPRESSION',
            owner: left,
            expr: expression,
        };
    }

    parsePostfix(left, token) {
        // left++
        if (token.text === OPERATORS.INC.literal) {
            return {
                nodeType: 'EXPRESSION',
                type: 'POSTFIX_INCREMENT_EXPRESSION',
                expr: left,
            };
        }

        // left--
        if (token.text === OPERATORS.DEC.literal) {
            return {
                nodeType: 'EXPRESSION',
                type: 'POSTFIX_DECREMENT_EXPRESSION',
                expr: left,
            };
        }

        // left.X
        if (token.text === OPERATORS.DOT.literal) {
            const memberName = this.expect(TokenType.IDENT);

            return {
                nodeType: 'EXPRESSION',
                type: 'MEMBER_EXPRESSION',
                owner: left,
                name: memberName.text,
            };
        }

        // left->X
        if (token.text === OPERATORS.ARROW.literal) {
            const memberName = this.expect(TokenType.IDENT);

            return {
                nodeType: 'EXPRESSION',
                type: 'PTR_MEMBER_EXPRESSION',
                object: left,
                name: memberName.text,
            };
        }
    }

    parseInfix(left, token, infixInfo) {
        const nextPrecedence = infixInfo.assoc === 'right' ? infixInfo.precedence - 1 : infixInfo.precedence;
        const right = this.parseExpression(nextPrecedence);

        // left = right
        if (token.text === OPERATORS.EQ.literal) {
            return {
                nodeType: 'EXPRESSION',
                type: 'ASSIGNMENT_EXPRESSION',
                left: left,
                right: right,
            };
        }

        // left <op> right
        return {
            nodeType: 'EXPRESSION',
            type: 'BINARY_OPERATION_EXPRESSION',
            operator: token.text,
            left: left,
            right: right,
        };
    }

    parsePrefix(token) {
        // *obj
        if (token.text === OPERATORS.STAR.literal) {
            return {
                nodeType: 'EXPRESSION',
                type: 'DEREF_EXPRESSION',
                expr: this.parseExpression(PREFIX_OPERATORS[token.text].precedence),
            };
        }

        // &obj
        if (token.text === OPERATORS.AND.literal) {
            return {
                nodeType: 'EXPRESSION',
                type: 'ADDRESS_EXPRESSION',
                expr: this.parseExpression(PREFIX_OPERATORS[token.text].precedence),
            };
        }

        // -obj
        if (token.text === OPERATORS.MINUS.literal) {
            return {
                nodeType: 'EXPRESSION',
                type: 'NEGATE_EXPRESSION',
                expr: this.parseExpression(PREFIX_OPERATORS[token.text].precedence),
            };
        }

        // ++obj
        if (token.text === OPERATORS.INC.literal) {
            return {
                nodeType: 'EXPRESSION',
                type: 'PREFIX_INCREMENT_EXPRESSION',
                expr: this.parseExpression(PREFIX_OPERATORS[token.text].precedence),
            };
        }

        // --obj
        if (token.text === OPERATORS.DEC.literal) {
            return {
                nodeType: 'EXPRESSION',
                type: 'PREFIX_DECREMENT_EXPRESSION',
                expr: this.parseExpression(PREFIX_OPERATORS[token.text].precedence),
            };
        }

        // Number
        if (token.type === TokenType.NUMBER) {
            return {
                nodeType: 'EXPRESSION',
                type: 'NUMBER_EXPRESSION',
                value: token.text,
            };
        }

        // Identifier (obj)
        if (token.type === TokenType.IDENT) {
            return {
                nodeType: 'EXPRESSION',
                type: 'IDENT_EXPRESSION',
                value: token.text,
            };
        }

        // Keyword (nullptr)
        const keyword = keywordLiteralsMap[token.text];
        if (keyword !== undefined) {
            return {
                nodeType: 'EXPRESSION',
                type: 'KEYWORD_EXPRESSION',
                keyword: keyword,
            };
        }

        // String literal ("obj")
        if (token.type === TokenType.STRING_LITERAL) {
            return {
                nodeType: 'EXPRESSION',
                type: 'STRING_LITERAL_EXPRESSION',
                value: token.text,
            };
        }

        // (...)
        if (token.type === TokenType.L_PAREN) {
            const expression = this.parseExpression();
            this.expect(TokenType.R_PAREN);
            return expression;
        }

        throw new Error(`Unexpected token in expression: '${token.type}' (${token.text})`);
    }
}
