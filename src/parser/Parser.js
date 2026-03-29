import { TokenType } from './Token.js';
import { PrattParser } from './PrattParser.js';

export class Parser {
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

    isPointerOrRef(token) {
        if (!token) return null;
        return token.text === '*' || token.text === '&';
    }

    isTypeModifier(token) {
        if (!token) return null;
        return ['const', 'static', 'unsigned', 'signed', 'long', 'short'].includes(token.text);
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

    skipAngleBrackets(index) {
        let depth = 0;

        while (index < this.tokens.length) {
            if (this.tokens[index].text === '<') depth++;
            if (this.tokens[index].text === '>') depth--;

            if (depth === 0) break;

            index++;
        }

        return index;
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

        const token = this.peek();
        if (token.type === TokenType.L_BRACE) return this.parseBlockStatement();
        if (token.type === TokenType.IF) return this.parseIfStatement();
        if (token.type === TokenType.WHILE) return this.parseWhileStatement();
        if (token.type === TokenType.FOR) return this.parseForStatement();
        if (token.type === TokenType.DELETE) return this.parseDeleteStatement();

        return this.parseExpressionStatement();
    }

    parseDeleteStatement() {
        this.expect(TokenType.DELETE);

        const deleted = this.parseExpression();

        this.expect(TokenType.SEMI);

        return {
            nodeType: 'STATEMENT',
            type: 'DELETE_STATEMENT',
            deleted: deleted,
        };
    }

    parseDeclarationStatement(expectSemicolon = true) {
        const typeModifiers = [];
        while (this.isTypeModifier(this.peek())) {
            typeModifiers.push(this.next().text);
        }

        let typeToken = this.expect(TokenType.IDENT);

        const typeParametersEnd = this.skipAngleBrackets(this.position);
        const typeParameterTokens = this.tokens.slice(this.position, typeParametersEnd);
        this.position = typeParametersEnd;

        while (this.isPointerOrRef(this.peek())) {
            typeParameterTokens.push(this.next().text);
        }

        let varNameToken = this.expect(TokenType.IDENT);

        let initExpression = null;
        if (this.peek().text === '=') {
            this.next();
            initExpression = this.parseExpression();
        }

        if (expectSemicolon) this.expect(TokenType.SEMI);

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

    parseIfStatement() {
        this.expect(TokenType.IF);

        this.expect(TokenType.L_PAREN);
        const condition = this.parseExpression(); // TODO: Validate
        this.expect(TokenType.R_PAREN);

        const then = this.parseStatement();
        if (then.type !== 'BLOCK_STATEMENT') throw new Error(`Expected block statement after 'if (...)'. Got: ${then.type}`);

        let else_ = null;
        if (this.peek() === TokenType.ELSE) {
            this.expect(TokenType.ELSE);
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
        this.expect(TokenType.WHILE);

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
        this.expect(TokenType.FOR);

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
        const parser = new PrattParser(this.tokens.slice(this.position));
        const expression = parser.parseExpression();
        this.position += parser.position;
        return expression;
    }
}
