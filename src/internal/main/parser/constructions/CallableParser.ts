import ConstructionParserUtils from '../generics/ConstructionParserUtils';
import CallablePrefixModifierType from '../../../core/entities/ast/constructions/callable/modifiers/CallablePrefixModifierType';
import CallablePostfixModifierType from '../../../core/entities/ast/constructions/callable/modifiers/CallablePostfixModifierType';
import CallableParameter from '../../../core/entities/ast/constructions/callable/params/CallableParameter';
import TokenType from '../../../core/entities/token/TokenType';
import TypeExpression from '../../../core/entities/ast/type/TypeExpression';
import Token from '../../../core/entities/token/Token';
import CallableDefinition from '../../../core/entities/ast/constructions/callable/definitions/CallableDefinition';
import { operators } from '../../../core/entities/operator/operators/operators';
import CallableDefinitionType from '../../../core/entities/ast/constructions/callable/definitions/CallableDefinitionType';
import { keywords } from '../../../core/entities/keyword/keywords/keywords';
import Statement from '../../../core/entities/ast/statements/Statement';
import StatementType from '../../../core/entities/ast/statements/StatementType';

export interface ParseFunctionDefinitionOptions {
    allowPureSpecifier?: boolean;
}

export class CallableParser extends ConstructionParserUtils {
    public parseCallablePrefixModifiers(): CallablePrefixModifierType[] {
        const prefixModifiers: CallablePrefixModifierType[] = [];
        while (CallablePrefixModifierType[this.peek()?.text?.toUpperCase() as keyof typeof CallablePrefixModifierType] !== undefined)
            prefixModifiers.push(CallablePrefixModifierType[this.next()?.text?.toUpperCase() as keyof typeof CallablePrefixModifierType]);

        return prefixModifiers;
    }

    public parseCallablePostfixModifiers(): CallablePostfixModifierType[] {
        const postfixModifiers: CallablePostfixModifierType[] = [];
        while (CallablePostfixModifierType[this.peek()?.text?.toUpperCase() as keyof typeof CallablePostfixModifierType] !== undefined)
            postfixModifiers.push(CallablePostfixModifierType[this.next()?.text?.toUpperCase() as keyof typeof CallablePostfixModifierType]);

        return postfixModifiers;
    }

    public parseCallableParameterList(): CallableParameter[] {
        this.expectNextToken(TokenType.L_PAREN);

        const params: CallableParameter[] = [];
        while (this.peek()?.tokenType !== TokenType.R_PAREN) {
            const paramType: TypeExpression = this.parseTypeExpression();
            const paramName: Token = this.expectNextToken(TokenType.IDENTIFIER);

            params.push({ name: paramName.text, type: paramType });

            if (this.peek()?.tokenType !== TokenType.R_PAREN) this.expectNextToken(TokenType.COMMA);
        }

        this.expectNextToken(TokenType.R_PAREN);
        return params;
    }

    public parseCallableDefinition(options: ParseFunctionDefinitionOptions = {}): CallableDefinition {
        const allowPureSpecifier: boolean = options.allowPureSpecifier ?? true;

        if (this.peek()?.tokenType === TokenType.OPERATOR && this.peek()?.text === operators.assign.literal) {
            this.expectNextToken(TokenType.OPERATOR);
            const definitionToken: Token = this.nextOrThrow();

            if (definitionToken.tokenType === TokenType.NUMBER) {
                if (definitionToken.text !== '0') throw new Error(`Only number '0' can be used as function definition`);
                if (!allowPureSpecifier) throw new Error(`Pure specifier '= 0' is not allowed here`);

                return { type: CallableDefinitionType.PURE };
            }

            if (definitionToken.tokenType !== TokenType.KEYWORD) throw Error(`Only '0' and keywords 'delete' and 'default' can be used as function definition`);

            switch (definitionToken.text) {
                case keywords.DELETE.literal:
                    return { type: CallableDefinitionType.DELETE };
                case keywords.DEFAULT.literal:
                    return { type: CallableDefinitionType.DEFAULT };
            }

            throw Error(`Unknown keyword specified as function definition: '${definitionToken.text}'`);
        }

        if (this.peek()?.tokenType !== TokenType.L_BRACE) throw Error('Function definition expected');

        const body: Statement = this.parseStatement();
        if (body.type !== StatementType.BLOCK_STATEMENT) throw Error('Expected block statement after function declaration');

        return {
            type: CallableDefinitionType.BODY,
            body: body,
        };
    }

    public parseOptionalCallableDefinition(options: ParseFunctionDefinitionOptions = {}): CallableDefinition | null {
        if (this.peek()?.tokenType === TokenType.SEMI) {
            this.expectNextToken(TokenType.SEMI);
            return null;
        }

        const definition: CallableDefinition = this.parseCallableDefinition(options);

        if (definition.type !== CallableDefinitionType.BODY) {
            this.expectNextToken(TokenType.SEMI);
        }

        return definition;
    }
}
