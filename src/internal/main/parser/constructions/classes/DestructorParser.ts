import MethodParser from './MethodParser';
import AccessModifierType from '../../../../core/entities/modifier/access/AccessModifierType';
import ClassName from '../../../../core/entities/ast/constructions/classes/ClassName';
import CallablePrefixModifierType from '../../../../core/entities/ast/constructions/callable/modifiers/CallablePrefixModifierType';
import TokenType from '../../../../core/entities/token/TokenType';
import { operators } from '../../../../core/entities/operator/operators/operators';
import CallablePostfixModifierType from '../../../../core/entities/ast/constructions/callable/modifiers/CallablePostfixModifierType';
import MethodPostfixModifierType from '../../../../core/entities/ast/constructions/classes/methods/modifiers/MethodModifierType';
import CallableDefinition from '../../../../core/entities/ast/constructions/callable/definitions/CallableDefinition';
import ASTNodeType from '../../../../core/entities/ast/ASTNodeType';
import DestructorDeclaration from '../../../../core/entities/ast/constructions/classes/destructors/DestructorDeclaration';
import DestructorDefinition from '../../../../core/entities/ast/constructions/classes/destructors/DestructorDefinition';

export default class DestructorParser extends MethodParser {
    public parseDestructorDeclaration(accessModifier: AccessModifierType, currentClassName: ClassName): DestructorDeclaration {
        const callablePrefixModifiers: CallablePrefixModifierType[] = this.parseCallablePrefixModifiers();

        this.expectNextToken(TokenType.OPERATOR, operators.bitwiseNot.literal);
        const nameToken = this.expectNextToken(TokenType.IDENTIFIER);

        if (nameToken.text !== currentClassName.name.name) {
            throw new Error(`Destructor name '${nameToken.text}' must match class name '${currentClassName.name.name}'`);
        }

        const name: ClassName = {
            name: currentClassName.name,
            typeParams: [],
        };

        const params = this.parseCallableParameterList();
        if (params.length > 0) {
            throw new Error(`Destructor '${currentClassName.name.name}' cannot have parameters`);
        }

        const callablePostfixModifiers: CallablePostfixModifierType[] = this.parseCallablePostfixModifiers();
        const methodPostfixModifiers: MethodPostfixModifierType[] = this.parseMethodPostfixModifiers();

        const callableDefinition: CallableDefinition | null = this.parseOptionalCallableDefinition({
            allowPureSpecifier: true,
        });

        const definition: DestructorDefinition = {
            callableDefinition: callableDefinition,
        };

        return {
            nodeType: ASTNodeType.DECLARATION,
            accessModifier: accessModifier,
            name: name,
            callablePrefixModifiers: callablePrefixModifiers,
            callablePostfixModifiers: callablePostfixModifiers,
            methodPostfixModifiers: methodPostfixModifiers,
            definition: definition,
        };
    }
}
