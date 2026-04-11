import TypeExpression from '../../../../core/entities/ast/type/TypeExpression';
import { CallableParser } from '../CallableParser';
import AccessModifierType from '../../../../core/entities/modifier/access/AccessModifierType';
import CallablePrefixModifierType from '../../../../core/entities/ast/constructions/callable/modifiers/CallablePrefixModifierType';
import QualifiedName from '../../../../core/entities/qualified_name/QualifiedName';
import CallableParameter from '../../../../core/entities/ast/constructions/callable/params/CallableParameter';
import CallablePostfixModifierType from '../../../../core/entities/ast/constructions/callable/modifiers/CallablePostfixModifierType';
import CallableDefinition from '../../../../core/entities/ast/constructions/callable/definitions/CallableDefinition';
import MethodPostfixModifierType from '../../../../core/entities/ast/constructions/classes/methods/modifiers/MethodModifierType';
import MethodDeclaration from '../../../../core/entities/ast/constructions/classes/methods/MethodDeclaration';
import ASTNodeType from '../../../../core/entities/ast/ASTNodeType';

export default class MethodParser extends CallableParser {
    protected parseMethodPostfixModifiers(): MethodPostfixModifierType[] {
        const prefixModifiers: MethodPostfixModifierType[] = [];
        while (MethodPostfixModifierType[this.peek()?.text?.toUpperCase() as keyof typeof MethodPostfixModifierType] !== undefined)
            prefixModifiers.push(MethodPostfixModifierType[this.next()?.text?.toUpperCase() as keyof typeof MethodPostfixModifierType]);

        return prefixModifiers;
    }

    public parseMethodDeclaration(accessModifier: AccessModifierType): MethodDeclaration {
        const callablePrefixModifiers: CallablePrefixModifierType[] = this.parseCallablePrefixModifiers();

        const returnTypeExpr: TypeExpression = this.parseTypeExpression();
        const name: QualifiedName = this.parseQualifiedName();
        const params: CallableParameter[] = this.parseCallableParameterList();

        const callablePostfixModifiers: CallablePostfixModifierType[] = this.parseCallablePostfixModifiers();
        const methodPostfixModifiers: MethodPostfixModifierType[] = this.parseMethodPostfixModifiers();

        const definition: CallableDefinition | null = this.parseOptionalCallableDefinition({ allowPureSpecifier: true });

        return {
            nodeType: ASTNodeType.DECLARATION,
            accessModifier: accessModifier,
            name: name,
            returnType: returnTypeExpr,
            params: params,
            callablePrefixModifiers: callablePrefixModifiers,
            callablePostfixModifiers: callablePostfixModifiers,
            methodPostfixModifiers: methodPostfixModifiers,
            definition: definition,
        };
    }
}
