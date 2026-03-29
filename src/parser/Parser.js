import { TokenType } from './Token.js';
import { PrattParser } from './PrattParser.js';

export class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
    }

    peek() {
        return this.tokens[this.position];
    }

    next() {
        return this.tokens[this.position++];
    }

    expect(type, text = null) {
        const next = this.next();

        if (next.type !== type) {
            throw new Error(`Expected token with type '${type}', got '${next.type}' (${next.text})`);
        }

        if (text !== null && next.text !== text) {
            throw new Error(`Expected token '${text}', got '${next.text}'`);
        }

        return next;
    }

    isDeclarationStart() {
        let pointer = this.position;

        while (this.isTypeModifier(this.tokens[pointer])) pointer++;

        // Expect type name
        if (this.tokens[pointer].type !== TokenType.IDENT) return false;
        pointer++;

        pointer = this.skipAngleBrackets(pointer);
        while (this.isPointerOrRef(this.tokens[pointer])) pointer++;

        // Expect var name
        // noinspection RedundantIfStatementJS
        if (this.tokens[pointer].type !== TokenType.IDENT) return false;

        return true;
    }

    skipAngleBrackets(i) {
        let depth = 0;

        while (i < this.tokens.length) {
            if (this.tokens[i].text === '<') depth++;
            if (this.tokens[i].text === '>') depth--;

            if (depth === 0) break;

            i++;
        }

        return i;
    }

    isPointerOrRef(token) {
        return token.text === '*' || token.text === '&';
    }

    isTypeModifier(token) {
        return ['const', 'static', 'unsigned', 'signed', 'long', 'short'].includes(token.text);
    }

    parseProgram() {
        const nodes = [];

        while (this.peek().type !== TokenType.EOF) {
            nodes.push(this.parseStatement());
        }

        return nodes;
    }

    parseStatement() {
        const token = this.peek();

        if (this.isDeclarationStart()) return this.parseDeclaration();
        if (token.type === TokenType.IF) return this.parseIfStatement();
        if (token.type === TokenType.WHILE) return this.parseWhileStatement();
        if (token.type === TokenType.FOR) return this.parseForStatement();
        if (token.type === TokenType.L_BRACE) return this.parseBlockStatement();

        return this.parseExpressionStatement();
    }

    parseDeclaration(expectSemicolon = true) {
        const typeModifiers = [];
        let current = this.peek();
        while (this.isTypeModifier(current)) {
            typeModifiers.push(current.text);
            current = this.next();
        }

        let typeToken = this.expect(TokenType.IDENT);

        const typeParametersEnd = this.skipAngleBrackets(this.position);
        const typeParameterTokens = this.tokens.slice(this.position, typeParametersEnd);
        this.position = typeParametersEnd;

        current = this.peek();
        while (this.isPointerOrRef(current)) {
            typeParameterTokens.push(current.text);
            current = this.next();
        }

        let varNameToken = this.expect(TokenType.IDENT);

        let initExpression = null;
        if (this.peek().text === '=') {
            this.next();
            initExpression = this.parseExpression();
        }

        if (expectSemicolon) {
            this.expect(TokenType.SEMI);
        }

        return {
            nodeType: 'STATEMENT',
            type: 'DECLARATION_STATEMENT',
            modifiers: typeModifiers,
            varType: typeToken.text,
            typeParameters: typeParameterTokens,
            name: varNameToken.text,
            init: initExpression,
        };
    }

    parseBlockStatement() {
        this.expect(TokenType.L_BRACE);

        const body = [];
        while (this.peek().type !== TokenType.R_BRACE) {
            body.push(this.parseStatement());
        }

        this.expect(TokenType.R_BRACE);
        return {
            nodeType: 'STATEMENT',
            type: 'BLOCK_STATEMENT',
            body: body,
        };
    }

    parseIfStatement() {
        this.expect(TokenType.IF);
        this.expect(TokenType.L_PAREN);
        const condition = this.parseExpression();
        this.expect(TokenType.R_PAREN);

        const then = this.parseStatement();

        let else_ = null;
        if (this.peek() === TokenType.ELSE) {
            this.expect(TokenType.ELSE);
            else_ = this.parseStatement();
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
        this.expect(TokenType.WHILE);
        this.expect(TokenType.L_PAREN);
        const condition = this.parseExpression();
        this.expect(TokenType.R_PAREN);

        const body = this.parseStatement();

        return {
            nodeType: 'STATEMENT',
            type: 'WHILE_STATEMENT',
            condition: condition,
            body: body,
        };
    }

    parseForStatement() {
        this.expect(TokenType.FOR);
        this.expect(TokenType.L_PAREN);

        let initExpression;
        if (this.isDeclarationStart()) {
            initExpression = this.parseDeclaration(false);
        } else {
            initExpression = this.parseExpression();
        }

        this.expect(TokenType.SEMI);
        const conditionExpression = this.parseExpression();
        this.expect(TokenType.SEMI);
        const stepExpression = this.parseExpression();
        this.expect(TokenType.R_PAREN);

        const body = this.parseStatement();

        return {
            nodeType: 'STATEMENT',
            type: 'FOR_STATEMENT',
            init: initExpression,
            condition: conditionExpression,
            step: stepExpression,
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
        const parser = new PrattParser(this.tokens.slice(this.position));
        const expression = parser.parseExpression();
        this.position += parser.position;
        return expression;
    }
}
