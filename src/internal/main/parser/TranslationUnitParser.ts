import TranslationUnit from '../../core/entities/ast/translation_unit/TranslationUnit';
import TopLevelDeclaration from '../../core/entities/ast/top_level/TopLevelDeclaration';
import ASTNodeType from '../../core/entities/ast/ASTNodeType';
import TokenType from '../../core/entities/token/TokenType';
import FunctionDefinition from '../../core/entities/ast/top_level/declarations/FunctionDefinition';
import TopLevelDeclarationStatement from '../../core/entities/ast/top_level/declarations/TopLevelDeclarationStatement';
import GenericTokenParser from '../common/parser/GenericTokenParser';
import TypedConstructLookAheadResult from '../common/entities/TypedConstructLookAheadResult';
import TypedConstructKind from '../common/entities/TypedConstructKind';
import Token from '../../core/entities/token/Token';
import { operators } from '../../core/entities/operator/operators/operators';
import Statement from '../../core/entities/ast/statements/Statement';
import Parser from './Parser';
import StatementType from '../../core/entities/ast/statements/StatementType';
import TopLevelDeclarationType from '../../core/entities/ast/top_level/TopLevelDeclarationType';
import TypeExpression from '../../core/entities/ast/type/TypeExpression';
import FunctionParameter from '../../core/entities/ast/top_level/declarations/FunctionParameter';

export default class TranslationUnitParser extends GenericTokenParser {
    private parseStatement(): Statement {
        const parser = new Parser(this.source, this.tokens, this.position);
        const result: Statement = parser.parseStatement();
        this.position = parser.currentPosition;
        return result;
    }

    private parseFunctionDefinition(): FunctionDefinition {
        const returnTypeExpr: TypeExpression = this.parseTypeExpression();

        const nameParts: string[] = [];
        nameParts.push(this.expectNextToken(TokenType.IDENTIFIER).text);

        while (this.peek()?.text === operators.namespaceAccess.literal) {
            this.expectNextToken(TokenType.OPERATOR, operators.namespaceAccess.literal);
            const part: Token = this.expectNextToken(TokenType.IDENTIFIER);
            nameParts.push(part.text);
        }

        this.expectNextToken(TokenType.L_PAREN);

        const params: FunctionParameter[] = [];
        while (this.peek()?.tokenType !== TokenType.R_PAREN) {
            const paramType: TypeExpression = this.parseTypeExpression();
            const paramName: Token = this.expectNextToken(TokenType.IDENTIFIER);
            if (this.peek()?.tokenType !== TokenType.R_PAREN) this.expectNextToken(TokenType.COMMA);
            params.push({ name: paramName.text, type: paramType });
        }

        this.expectNextToken(TokenType.R_PAREN);

        const body: Statement = this.parseStatement();
        if (body.type !== StatementType.BLOCK_STATEMENT) throw Error('Expected block statement after function declaration');

        return {
            nodeType: ASTNodeType.TOP_LEVEL_DECLARATION,
            type: TopLevelDeclarationType.FUNCTION_DEFINITION,
            returnType: returnTypeExpr,
            name: {
                name: nameParts[nameParts.length - 1],
                scope: nameParts.slice(0, nameParts.length - 1),
            },
            params: params,
            body: body,
        };
    }

    private parseDeclarationStatement(): TopLevelDeclarationStatement {
        const statement: Statement = this.parseStatement();
        if (statement.type !== StatementType.DECLARATION_STATEMENT) throw Error('Only declaration statements allowed as top level statement');

        return {
            nodeType: ASTNodeType.TOP_LEVEL_DECLARATION,
            type: TopLevelDeclarationType.DECLARATION_STATEMENT,
            statement: statement,
        };
    }

    public parseTopLevelDeclaration(): TopLevelDeclaration {
        const lookAheadResult: TypedConstructLookAheadResult = this.lookAheadTypedConstruct();

        if (lookAheadResult.kind === TypedConstructKind.FUNCTION_DEFINITION) return this.parseFunctionDefinition();
        if (lookAheadResult.kind === TypedConstructKind.VARIABLE_DECLARATION) return this.parseDeclarationStatement();
        if (lookAheadResult.kind === TypedConstructKind.NONE) throw Error('Expected top level declaration');

        throw Error(`Unsupported typed construct kind: '${TypedConstructKind}'`);
    }

    public parseTranslationUnit(): TranslationUnit {
        const declarations: TopLevelDeclaration[] = [];

        while (this.peek()?.tokenType !== TokenType.EOF) declarations.push(this.parseTopLevelDeclaration());

        return {
            nodeType: ASTNodeType.TRANSLATION_UNIT,
            declarations: declarations,
        };
    }
}
