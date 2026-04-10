import TokenType from '../../../core/entities/token/TokenType';
import tokenType from '../../../core/entities/token/TokenType';
import TypeExpression from '../../../core/entities/ast/type/TypeExpression';
import QualifiedName from '../../../core/entities/qualified_name/QualifiedName';
import FunctionParameter from '../../../core/entities/ast/constructions/functions/params/FunctionParameter';
import Statement from '../../../core/entities/ast/statements/Statement';
import StatementType from '../../../core/entities/ast/statements/StatementType';
import Token from '../../../core/entities/token/Token';
import ConstructionParserUtils from '../generics/ConstructionParserUtils';
import BaseFunctionDefinition from '../../../core/entities/ast/constructions/functions/BaseFunctionDefinition';
import FunctionDeclaration from '../../../core/entities/ast/constructions/functions/FunctionDeclaration';
import { operators } from '../../../core/entities/operator/operators/operators';
import { keywords } from '../../../core/entities/keyword/keywords/keywords';
import FunctionDefinitionType from '../../../core/entities/ast/constructions/functions/FunctionDefinitionType';
import FunctionDefinition from '../../../core/entities/ast/constructions/functions/FunctionDefinition';
import FunctionPrefixModifierType from '../../../core/entities/ast/constructions/functions/modifiers/FunctionPrefixModifierType';
import FunctionPostfixModifierType from '../../../core/entities/ast/constructions/functions/modifiers/FunctionPostfixModifierType';

export default class FunctionParser extends ConstructionParserUtils {
    private parseFunctionDefinition(): FunctionDefinition {
        if (this.peek()?.tokenType === TokenType.OPERATOR && this.peek()?.text === operators.assign.literal) {
            this.expectNextToken(tokenType.OPERATOR);
            const definitionToken: Token = this.nextOrThrow();

            if (definitionToken.tokenType === TokenType.NUMBER) {
                if (definitionToken.text !== '0') throw new Error(`Only number '0' can be used as function definition`);
                return { type: FunctionDefinitionType.DELETE };
            }

            if (definitionToken.tokenType !== TokenType.KEYWORD) throw Error(`Only '0' and keywords 'delete' and 'default' can be used as function definition`);

            switch (definitionToken.text) {
                case keywords.DELETE.literal:
                    return { type: FunctionDefinitionType.DELETE };
                case keywords.DEFAULT.literal:
                    return { type: FunctionDefinitionType.DEFAULT };
            }

            throw Error(`Unknown keyword specified as function definition: '${definitionToken.text}'`);
        }

        if (this.peek()?.tokenType !== TokenType.L_BRACE) throw Error('Function definition expected');

        const body: Statement = this.parseStatement();
        if (body.type !== StatementType.BLOCK_STATEMENT) throw Error('Expected block statement after function declaration');

        return {
            type: FunctionDefinitionType.BODY,
            body: body,
        };
    }

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

    public parseFunctionDeclaration(): FunctionDeclaration {
        const prefixModifiers: FunctionPrefixModifierType[] = [];
        while (FunctionPrefixModifierType[this.peek()?.text?.toUpperCase() as keyof typeof FunctionPrefixModifierType] !== undefined)
            prefixModifiers.push(FunctionPrefixModifierType[this.next()?.text?.toUpperCase() as keyof typeof FunctionPrefixModifierType]);

        const returnTypeExpr: TypeExpression = this.parseTypeExpression();

        const name: QualifiedName = this.parseQualifiedName();
        const params: FunctionParameter[] = this.parseParameterList();

        const postfixModifiers: FunctionPostfixModifierType[] = [];
        while (FunctionPostfixModifierType[this.peek()?.text?.toUpperCase() as keyof typeof FunctionPostfixModifierType] !== undefined)
            postfixModifiers.push(FunctionPostfixModifierType[this.next()?.text?.toUpperCase() as keyof typeof FunctionPostfixModifierType]);

        let definition: BaseFunctionDefinition | null = null;
        if (this.peek()?.tokenType !== TokenType.SEMI) definition = this.parseFunctionDefinition();

        return {
            name: name,
            returnType: returnTypeExpr,
            params: params,
            prefixModifiers: prefixModifiers,
            postfixModifiers: postfixModifiers,
            definition: definition,
        };
    }
}
