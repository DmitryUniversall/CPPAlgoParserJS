import TokenType from '../../../core/entities/token/TokenType';
import TypeExpression from '../../../core/entities/ast/type/TypeExpression';
import QualifiedName from '../../../core/entities/qualified_name/QualifiedName';
import FunctionParameter from '../../../core/entities/ast/constructions/functions/params/FunctionParameter';
import Statement from '../../../core/entities/ast/statements/Statement';
import StatementType from '../../../core/entities/ast/statements/StatementType';
import Token from '../../../core/entities/token/Token';
import ConstructionParserUtils from '../generics/ConstructionParserUtils';
import FunctionDefinition from '../../../core/entities/ast/constructions/functions/FunctionDefinition';
import FunctionDeclaration from '../../../core/entities/ast/constructions/functions/FunctionDeclaration';

export default class FunctionParser extends ConstructionParserUtils {
    public parseParameterList(): FunctionParameter[] {
        this.expectNextToken(TokenType.L_PAREN);

        const params: FunctionParameter[] = [];
        while (this.peek()?.tokenType !== TokenType.R_PAREN) {
            const paramType: TypeExpression = this.parseTypeExpression();
            const paramName: Token = this.expectNextToken(TokenType.IDENTIFIER);

            params.push({ name: paramName.text, type: paramType });

            if (this.peek()?.tokenType !== TokenType.R_PAREN) this.expectNextToken(TokenType.COMMA);
        }

        this.expectNextToken(TokenType.R_PAREN);
        return params;
    }

    public parseFunctionDefinition(): FunctionDefinition | null {
        const body: Statement = this.parseStatement();
        if (body.type !== StatementType.BLOCK_STATEMENT) throw Error('Expected block statement after function declaration');

        return {
            body: body,
        };
    }

    public parseFunctionDeclaration(): FunctionDeclaration {
        const returnTypeExpr: TypeExpression = this.parseTypeExpression();

        const name: QualifiedName = this.parseQualifiedName();
        const params: FunctionParameter[] = this.parseParameterList();

        let definition: FunctionDefinition | null = null;
        if (this.peek()?.tokenType !== TokenType.SEMI) definition = this.parseFunctionDefinition();

        return {
            name: name,
            returnType: returnTypeExpr,
            params: params,
            definition: definition,
        };
    }
}
