import { TokenType } from './Token.js';
import { PrattParser } from './PrattParser.js';
import { KEYWORDS } from './lexer/keywords.js';
import { OPERATORS } from './lexer/operators.js';

export class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
    }

    peek(required = false) {
        if (this.position >= this.tokens.length && required) throw new Error('Next token is required, but was not found');
        return this.position < this.tokens.length ? this.tokens[this.position] : null;
    }

    next(required = false) {
        if (this.position >= this.tokens.length && required) throw new Error('Next token is required, but was not found');
        return this.position < this.tokens.length ? this.tokens[this.position++] : null;
    }

    expect(type, text = null) {
        const next = this.next();

        if (!next) throw new Error(`Expected token: '${type}' (${text ?? 'Any'}), but nothing was found`);
        if (next.type !== type) throw new Error(`Expected token type '${type}', got '${next.type}' (${next.text})`);
        if (text !== null && next.text !== text) throw new Error(`Expected '${text}', got '${next.text}'`);

        return next;
    }

    isDeclarationStart() {
        let pointer = this.position;

        try {
            const parser = new PrattParser(this.tokens.slice(this.position));
            parser.parseTypeExpression();
            pointer += parser.position;
        } catch (e) {
            // console.debug(e);
            return false;
        }

        // Expect var name
        // noinspection RedundantIfStatementJS
        if (!this.tokens[pointer] || this.tokens[pointer].type !== TokenType.IDENT) return false;

        return true;
    }

    parseProgram() {
        const nodes = [];

        while (this.peek()?.type !== TokenType.EOF) {
            nodes.push(this.parseStatement());
        }

        return nodes;
    }

    parseStatement() {
        if (this.isDeclarationStart()) return this.parseDeclarationStatement();

        const token = this.peek(true);
        if (token.type === TokenType.L_BRACE) return this.parseBlockStatement();
        if (token.type === TokenType.KEYWORD) return this.parseKeywordStatement();

        return this.parseExpressionStatement();
    }

    parseKeywordStatement() {
        const token = this.expect(TokenType.KEYWORD);

        if (token.text === KEYWORDS.IF.literal) return this.parseIfStatement();
        if (token.text === KEYWORDS.WHILE.literal) return this.parseWhileStatement();
        if (token.text === KEYWORDS.FOR.literal) return this.parseForStatement();
        if (token.text === KEYWORDS.DELETE.literal) return this.parseDeleteStatement();

        throw new Error(`Unknown keyword: '${token.text}'`);
    }

    parseDeclarationStatement(expectSemicolon = true) {
        const typeExpression = this.parseTypeExpression();

        const declarations = [];

        while (true) {
            const name = this.expect(TokenType.IDENT).text;

            let initExpression = null;
            if (this.peek()?.text === OPERATORS.ASSIGN.literal) {
                this.expect(TokenType.OP);
                initExpression = this.parseExpression();
            }

            declarations.push({ name: name, init: initExpression });

            if (this.peek()?.type !== TokenType.COMMA) break;
            this.expect(TokenType.COMMA);
        }

        if (expectSemicolon) this.expect(TokenType.SEMI);

        return {
            nodeType: 'STATEMENT',
            type: 'DECLARATION_STATEMENT',
            varTypeExpr: typeExpression,
            declarations: declarations,
        };
    }

    parseBlockStatement() {
        this.expect(TokenType.L_BRACE);

        const body = [];
        while (this.peek()?.type !== TokenType.R_BRACE) {
            body.push(this.parseStatement());
        }

        this.expect(TokenType.R_BRACE);

        return {
            nodeType: 'STATEMENT',
            type: 'BLOCK_STATEMENT',
            body: body,
        };
    }

    parseDeleteStatement() {
        const deleted = this.parseExpression();

        this.expect(TokenType.SEMI);

        return {
            nodeType: 'STATEMENT',
            type: 'DELETE_STATEMENT',
            deleted: deleted,
        };
    }

    parseIfStatement() {
        this.expect(TokenType.L_PAREN);
        const condition = this.parseExpression(); // TODO: Validate
        this.expect(TokenType.R_PAREN);

        const then = this.parseStatement();
        if (then.type !== 'BLOCK_STATEMENT') throw new Error(`Expected block statement after 'if (...)'. Got: ${then.type}`);

        let else_ = null;
        const nextToken = this.peek();
        if (nextToken.type === TokenType.KEYWORD && nextToken.text === KEYWORDS.ELSE.literal) {
            this.expect(TokenType.KEYWORD);
            else_ = this.parseStatement();
            if (else_.type !== 'BLOCK_STATEMENT') throw new Error(`Expected block statement after 'else'. Got: ${else_.type}`);
        }

        return {
            nodeType: 'STATEMENT',
            type: 'IF_STATEMENT',
            condition: condition,
            then: then,
            else: else_,
        };
    }

    parseWhileStatement() {
        this.expect(TokenType.L_PAREN);
        const condition = this.parseExpression(); // TODO: Validate
        this.expect(TokenType.R_PAREN);

        const body = this.parseStatement();
        if (body.type !== 'BLOCK_STATEMENT') throw new Error(`Expected block statement after 'while (...)'. Got: ${body.type}`);

        return {
            nodeType: 'STATEMENT',
            type: 'WHILE_STATEMENT',
            condition: condition,
            body: body,
        };
    }

    parseForStatement() {
        // TODO: Support 'for(;;)'
        this.expect(TokenType.L_PAREN);

        const init = this.isDeclarationStart() ? this.parseDeclarationStatement(false) : this.parseExpression();
        this.expect(TokenType.SEMI);
        const condition = this.parseExpression();
        this.expect(TokenType.SEMI);
        const step = this.parseExpression();

        this.expect(TokenType.R_PAREN);

        const body = this.parseStatement();
        if (body.type !== 'BLOCK_STATEMENT') throw new Error(`Expected block statement after 'for (...)'. Got: ${body.type}`);

        return {
            nodeType: 'STATEMENT',
            type: 'FOR_STATEMENT',
            init: init,
            condition: condition,
            step: step,
            body: body,
        };
    }

    parseExpressionStatement() {
        const expr = this.parseExpression();

        this.expect(TokenType.SEMI);

        return {
            nodeType: 'STATEMENT',
            type: 'EXPRESSION_STATEMENT',
            expr,
        };
    }

    parseExpression() {
        const parser = new PrattParser(this.tokens.slice(this.position)); // TODO: pass by ref + pass offset
        const expression = parser.parseExpression();
        this.position += parser.position;
        return expression;
    }

    parseTypeExpression() {
        const parser = new PrattParser(this.tokens.slice(this.position));
        const expression = parser.parseTypeExpression();
        this.position += parser.position;
        return expression;
    }
}
