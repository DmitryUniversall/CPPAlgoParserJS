import TranslationUnit from '../../core/entities/ast/translation_unit/TranslationUnit';
import TopLevelDeclaration from '../../core/entities/ast/top_level/TopLevelDeclaration';
import ASTNodeType from '../../core/entities/ast/ASTNodeType';
import TokenType from '../../core/entities/token/TokenType';
import TopLevelFunctionDefinition from '../../core/entities/ast/top_level/declarations/TopLevelFunctionDefinition';
import TopLevelDeclarationStatement from '../../core/entities/ast/top_level/declarations/TopLevelDeclarationStatement';
import TypedConstructLookAheadResult from './entities/TypedConstructLookAheadResult';
import TypedConstructKind from './entities/TypedConstructKind';
import Statement from '../../core/entities/ast/statements/Statement';
import StatementType from '../../core/entities/ast/statements/StatementType';
import TopLevelDeclarationType from '../../core/entities/ast/top_level/TopLevelDeclarationType';
import { keywords } from '../../core/entities/keyword/keywords/keywords';
import ClassDeclaration from '../../core/entities/ast/constructions/classes/ClassDeclaration';
import TopLevelClassDeclaration from '../../core/entities/ast/top_level/declarations/TopLevelClassDeclaration';
import ConstructionParserUtils from './generics/ConstructionParserUtils';
import FunctionParser from './constructions/FunctionParser';
import ClassParser from './constructions/ClassParser';
import FunctionDeclaration from '../../core/entities/ast/constructions/functions/FunctionDeclaration';

export default class TranslationUnitParser extends ConstructionParserUtils {
    private parseFunctionDeclaration(): FunctionDeclaration {
        const parser = new FunctionParser(this.source, this.tokens, this.position);
        const result: FunctionDeclaration = parser.parseFunctionDeclaration();
        this.position = parser.currentPosition;
        return result;
    }

    private parseClassDeclaration(): ClassDeclaration {
        const parser = new ClassParser(this.source, this.tokens, this.position);
        const result: ClassDeclaration = parser.parseClassDeclaration();
        this.position = parser.currentPosition;
        return result;
    }

    private parseTopLevelFunctionDefinition(): TopLevelFunctionDefinition {
        const declaration: FunctionDeclaration = this.parseFunctionDeclaration();

        return {
            nodeType: ASTNodeType.TOP_LEVEL_DECLARATION,
            type: TopLevelDeclarationType.FUNCTION_DECLARATION,
            declaration: declaration,
        };
    }

    private parseTopLevelClassDeclaration(): TopLevelClassDeclaration {
        const declaration: ClassDeclaration = this.parseClassDeclaration();

        return {
            nodeType: ASTNodeType.TOP_LEVEL_DECLARATION,
            type: TopLevelDeclarationType.CLASS_DECLARATION,
            declaration: declaration,
        };
    }

    private parseTopLevelVariableDeclaration(): TopLevelDeclarationStatement {
        const statement: Statement = this.parseStatement();
        if (statement.type !== StatementType.DECLARATION_STATEMENT) throw Error('Only declaration statements allowed as top level statement');

        return {
            nodeType: ASTNodeType.TOP_LEVEL_DECLARATION,
            type: TopLevelDeclarationType.DECLARATION_STATEMENT,
            statement: statement,
        };
    }

    public parseTopLevelDeclaration(): TopLevelDeclaration {
        if (this.peek()?.text === keywords.CLASS.literal) return this.parseTopLevelClassDeclaration();

        const lookAheadResult: TypedConstructLookAheadResult = this.lookAheadTypedConstruct();
        switch (lookAheadResult.kind) {
            case TypedConstructKind.FUNCTION_DEFINITION:
                return this.parseTopLevelFunctionDefinition();
            case TypedConstructKind.VARIABLE_DECLARATION:
                return this.parseTopLevelVariableDeclaration();
            case TypedConstructKind.NONE:
                throw Error('Expected top level declaration');
            default:
                throw Error(`Unsupported typed construct kind: '${TypedConstructKind}'`);
        }
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
