import { TokenType } from './Token.js';

const PREFIX_OPERATORS = {
    '*': { precedence: 8 },
    '&': { precedence: 8 },
    '-': { precedence: 8 },
    '--': { precedence: 8 },
    '++': { precedence: 8 },
};

const INFIX_OPERATORS = {
    '=': { precedence: 1, assoc: 'right' },

    '||': { precedence: 2 },
    '&&': { precedence: 3 },

    '==': { precedence: 4 },
    '!=': { precedence: 4 },

    '<': { precedence: 5 },
    '>': { precedence: 5 },
    '<=': { precedence: 5 },
    '>=': { precedence: 5 },

    '+': { precedence: 6 },
    '-': { precedence: 6 },

    '*': { precedence: 7 },
    '/': { precedence: 7 },
};

const POSTFIX_OPERATORS = {
    '--': { precedence: 8 },
    '++': { precedence: 8 },
    '->': { precedence: 9 },
    '.': { precedence: 9 },
};

export class PrattParser {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
    }

    peek() {
        return this.position < this.tokens.length ? this.tokens[this.position] : null;
    }

    next(required = false) {
        if (this.position >= this.tokens.length && required) throw new Error("Next token is required, but was not found");
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
        if (token.text === '++') {
            return {
                nodeType: 'EXPRESSION',
                type: 'POST_INCREMENT_EXPRESSION',
                expr: left,
            };
        }

        // left--
        if (token.text === '--') {
            return {
                nodeType: 'EXPRESSION',
                type: 'POST_DECREMENT_EXPRESSION',
                expr: left,
            };
        }

        if (token.text === ".") {
            const memberName = this.expect(TokenType.IDENT);

            return {
                nodeType: 'EXPRESSION',
                type: 'MEMBER_EXPRESSION',
                owner: left,
                name: memberName.text,
            };
        }

        if (token.text === '->') {
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

        if (token.text === '=') {
            return {
                nodeType: 'EXPRESSION',
                type: 'ASSIGNMENT_EXPRESSION',
                left: left,
                right: right,
            };
        }

        return {
            nodeType: 'EXPRESSION',
            type: 'BINARY_OPERATION_EXPRESSION',
            operator: token.text,
            left: left,
            right: right,
        };
    }

    parsePrefix(token) {
        // *i
        if (token.text === '*') {
            return {
                nodeType: 'EXPRESSION',
                type: 'DEREF_EXPRESSION',
                expr: this.parseExpression(PREFIX_OPERATORS[token.text].precedence),
            };
        }

        // &i
        if (token.text === '&') {
            return {
                nodeType: 'EXPRESSION',
                type: 'ADDRESS_EXPRESSION',
                expr: this.parseExpression(PREFIX_OPERATORS[token.text].precedence),
            };
        }

        // -i
        if (token.text === '-') {
            return {
                nodeType: 'EXPRESSION',
                type: 'NEGATE_EXPRESSION',
                expr: this.parseExpression(PREFIX_OPERATORS[token.text].precedence),
            };
        }

        // --i
        if (token.text === '--') {
            return {
                nodeType: 'EXPRESSION',
                type: 'PRE_DECREMENT_EXPRESSION',
                expr: this.parseExpression(PREFIX_OPERATORS[token.text].precedence),
            };
        }

        // ++i
        if (token.text === '++') {
            return {
                nodeType: 'EXPRESSION',
                type: 'PRE_INCREMENT_EXPRESSION',
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

        // (...)
        if (token.type === TokenType.L_PAREN) {
            const expression = this.parseExpression();
            this.expect(TokenType.R_PAREN);
            return expression;
        }

        if (token.type === TokenType.IDENT) {
            return {
                nodeType: 'EXPRESSION',
                type: 'IDENT_EXPRESSION',
                value: token.text,
            };
        }

        if (token.type === TokenType.NULLPTR) {
            return {
                nodeType: 'EXPRESSION',
                type: 'NULLPTR_EXPRESSION',
                value: token.text,
            };
        }

        if (token.type === TokenType.STRING_LITERAL) {
            return {
                nodeType: 'EXPRESSION',
                type: 'STRING_LITERAL_EXPRESSION',
                value: token.text,
            };
        }

        throw new Error(`Unexpected token in expression: '${token.type}' (${token.text})`);
    }
}
