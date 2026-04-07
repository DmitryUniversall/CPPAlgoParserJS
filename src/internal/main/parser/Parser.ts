import TokenType from '../../core/entities/token/TokenType';
import ASTNodeType from '../../core/entities/ast/ASTNodeType';
import StatementType from '../../core/entities/ast/statements/StatementType';
import DeclarationInfo from '../../core/entities/ast/statements/statements/declaration/DeclarationInfo';
import TypeExpression from '../../core/entities/ast/type/TypeExpression';
import { operators } from '../../core/entities/operator/operators/operators';
import Expression from '../../core/entities/ast/expressions/Expression';
import PrattParser from './PrattParser';
import ConstructorCallExpression from '../../core/entities/ast/expressions/expressions/other/ConstructorCallExpression';
import BlockStatement from '../../core/entities/ast/statements/statements/BlockStatement';
import DeleteStatement from '../../core/entities/ast/statements/statements/DeleteStatement';
import IfStatement from '../../core/entities/ast/statements/statements/IfStatement';
import { keywords } from '../../core/entities/keyword/keywords/keywords';
import WhileStatement from '../../core/entities/ast/statements/statements/WhileStatement';
import DeclarationStatement from '../../core/entities/ast/statements/statements/declaration/DeclarationStatement';
import ForStatement from '../../core/entities/ast/statements/statements/ForStatement';
import ExpressionStatement from '../../core/entities/ast/statements/statements/ExpressionStatement';
import Token from '../../core/entities/token/Token';
import Statement from '../../core/entities/ast/statements/Statement';
import DoWhileStatement from '../../core/entities/ast/statements/statements/DoWhileStatement';
import GenericTokenParser from '../common/parser/GenericTokenParser';

export default class Parser extends GenericTokenParser {
    private isDeclarationStart(): boolean {
        let pointer: number = this.position;

        try {
            const { endPosition } = this.typeLookAhead();
            pointer = endPosition;
        } catch (e) {
            // console.debug(e); // TODO: Log it?
            return false;
        }

        // Expect var name
        // noinspection RedundantIfStatementJS
        if (!this.tokens[pointer] || this.tokens[pointer].tokenType !== TokenType.IDENTIFIER) return false;

        return true;
    }

    private parseConstructorCallExpression(name: string): ConstructorCallExpression {
        const parser = new PrattParser(this.source, this.tokens, this.position);
        const result: ConstructorCallExpression = parser.parseConstructorCall(name);
        this.position = parser.currentPosition;
        return result;
    }

    private parseDeclarationStatement(expectSemicolon = true): DeclarationStatement {
        const declarations: DeclarationInfo[] = [];

        const varTypeExpr: TypeExpression = this.parseTypeExpression();

        while (true) {
            const name = this.expectNextToken(TokenType.IDENTIFIER).text;

            let initExpr: Expression | null = null;
            if (this.peek()?.tokenType === TokenType.L_PAREN) {
                initExpr = this.parseConstructorCallExpression(name);
            }

            if (this.peek()?.text === operators.assign.literal) {
                this.expectNextToken(TokenType.OPERATOR);
                initExpr = this.parseExpression();
            }

            let arrayLengthExpr: Expression | null = null;
            if (this.peek()?.tokenType === TokenType.L_BRACKET) {
                this.expectNextToken(TokenType.L_BRACKET);
                arrayLengthExpr = this.parseExpression();
                this.expectNextToken(TokenType.R_BRACKET);
            }

            declarations.push({ name: name, init: initExpr, arrayLength: arrayLengthExpr });

            if (this.peek()?.tokenType !== TokenType.COMMA) break;
            this.expectNextToken(TokenType.COMMA);
        }

        if (expectSemicolon) this.expectNextToken(TokenType.SEMI);

        return {
            nodeType: ASTNodeType.STATEMENT,
            type: StatementType.DECLARATION_STATEMENT,
            varType: varTypeExpr,
            declarations: declarations,
        };
    }

    private parseBlockStatement(): BlockStatement {
        this.expectNextToken(TokenType.L_BRACE);

        const body = [];
        while (this.peek()?.tokenType !== TokenType.R_BRACE) body.push(this.parseStatement());
        this.expectNextToken(TokenType.R_BRACE);

        return {
            nodeType: ASTNodeType.STATEMENT,
            type: StatementType.BLOCK_STATEMENT,
            body: body,
        };
    }

    private parseDeleteStatement(): DeleteStatement {
        this.expectNextToken(TokenType.KEYWORD, keywords.DELETE.literal);

        const deleted = this.parseExpression();

        this.expectNextToken(TokenType.SEMI);

        return {
            nodeType: ASTNodeType.STATEMENT,
            type: StatementType.DELETE_STATEMENT,
            deleted: deleted,
        };
    }

    private parseIfStatement(): IfStatement {
        this.expectNextToken(TokenType.KEYWORD, keywords.IF.literal);

        this.expectNextToken(TokenType.L_PAREN);
        const condition: Expression = this.parseExpression();
        this.expectNextToken(TokenType.R_PAREN);

        const thenStmt: BlockStatement = this.parseBlockStatement();

        let elseStmt: BlockStatement | null = null;
        const nextToken = this.peek();
        if (nextToken?.tokenType === TokenType.KEYWORD && nextToken.text === keywords.ELSE.literal) {
            this.expectNextToken(TokenType.KEYWORD);
            elseStmt = this.parseBlockStatement();
        }

        return {
            nodeType: ASTNodeType.STATEMENT,
            type: StatementType.IF_STATEMENT,
            condition: condition,
            thenStmt: thenStmt,
            elseStmt: elseStmt,
        };
    }

    private parseWhileStatement(): WhileStatement {
        this.expectNextToken(TokenType.KEYWORD, keywords.WHILE.literal);

        this.expectNextToken(TokenType.L_PAREN);
        const condition: Expression = this.parseExpression();
        this.expectNextToken(TokenType.R_PAREN);

        const body: BlockStatement = this.parseBlockStatement();

        return {
            nodeType: ASTNodeType.STATEMENT,
            type: StatementType.WHILE_STATEMENT,
            condition: condition,
            body: body,
        };
    }

    private parseDoWhileStatement(): DoWhileStatement {
        this.expectNextToken(TokenType.KEYWORD, keywords.DO.literal);

        const body: BlockStatement = this.parseBlockStatement();

        this.expectNextToken(TokenType.KEYWORD, keywords.WHILE.literal);

        this.expectNextToken(TokenType.L_PAREN);
        const condition: Expression = this.parseExpression();
        this.expectNextToken(TokenType.R_PAREN);

        this.expectNextToken(TokenType.SEMI);

        return {
            nodeType: ASTNodeType.STATEMENT,
            type: StatementType.DO_WHILE_STATEMENT,
            condition: condition,
            body: body,
        };
    }

    private parseForStatement(): ForStatement {
        this.expectNextToken(TokenType.KEYWORD, keywords.FOR.literal);

        this.expectNextToken(TokenType.L_PAREN);

        const init: Expression | DeclarationStatement = this.isDeclarationStart() ? this.parseDeclarationStatement(false) : this.parseExpression();
        this.expectNextToken(TokenType.SEMI);

        const condition: Expression = this.parseExpression();
        this.expectNextToken(TokenType.SEMI);

        const step: Expression = this.parseExpression();
        this.expectNextToken(TokenType.R_PAREN);

        const body: BlockStatement = this.parseBlockStatement();

        return {
            nodeType: ASTNodeType.STATEMENT,
            type: StatementType.FOR_STATEMENT,
            init: init,
            condition: condition,
            step: step,
            body: body,
        };
    }

    private parseExpressionStatement(): ExpressionStatement {
        const expr = this.parseExpression();

        this.expectNextToken(TokenType.SEMI);

        return {
            nodeType: ASTNodeType.STATEMENT,
            type: StatementType.EXPRESSION_STATEMENT,
            expr: expr,
        };
    }

    private parseKeywordStatement() {
        const token: Token = this.peekOrThrow();
        if (token.tokenType !== TokenType.KEYWORD) throw new Error(`Unexpected token type for keyword statement: '${token.tokenType}' ('${token.text}')`);

        if (token.text === keywords.IF.literal) return this.parseIfStatement();
        if (token.text === keywords.WHILE.literal) return this.parseWhileStatement();
        if (token.text === keywords.DO.literal) return this.parseDoWhileStatement();
        if (token.text === keywords.FOR.literal) return this.parseForStatement();
        if (token.text === keywords.DELETE.literal) return this.parseDeleteStatement();

        throw new Error(`Unknown keyword: '${token.text}'`);
    }

    public parseStatement(): Statement {
        if (this.isDeclarationStart()) return this.parseDeclarationStatement();

        const token: Token = this.peekOrThrow();
        if (token.tokenType === TokenType.L_BRACE) return this.parseBlockStatement();
        if (token.tokenType === TokenType.KEYWORD) return this.parseKeywordStatement();

        return this.parseExpressionStatement();
    }

    public parseAlgorithm(): Statement[] {
        const statements: Statement[] = [];
        while (this.peek()?.tokenType !== TokenType.EOF) statements.push(this.parseStatement());
        return statements;
    }
}
