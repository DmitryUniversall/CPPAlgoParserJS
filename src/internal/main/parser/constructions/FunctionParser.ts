import TypeExpression from '../../../core/entities/ast/type/TypeExpression';
import QualifiedName from '../../../core/entities/qualified_name/QualifiedName';
import CallableParameter from '../../../core/entities/ast/constructions/callable/params/CallableParameter';
import CallablePrefixModifierType from '../../../core/entities/ast/constructions/callable/modifiers/CallablePrefixModifierType';
import CallablePostfixModifierType from '../../../core/entities/ast/constructions/callable/modifiers/CallablePostfixModifierType';
import { CallableParser } from './CallableParser';
import CallableDefinition from '../../../core/entities/ast/constructions/callable/definitions/CallableDefinition';
import FunctionDeclaration from '../../../core/entities/ast/constructions/functions/FunctionDeclaration';
import ASTNodeType from '../../../core/entities/ast/ASTNodeType';

export default class FunctionParser extends CallableParser {
    public parseFunctionDeclaration(): FunctionDeclaration {
        const prefixModifiers: CallablePrefixModifierType[] = this.parseCallablePrefixModifiers();

        const returnTypeExpr: TypeExpression = this.parseTypeExpression();
        const name: QualifiedName = this.parseQualifiedName();
        const params: CallableParameter[] = this.parseCallableParameterList();

        const postfixModifiers: CallablePostfixModifierType[] = this.parseCallablePostfixModifiers();

        const definition: CallableDefinition | null = this.parseOptionalCallableDefinition({ allowPureSpecifier: true });

        return {
            nodeType: ASTNodeType.DECLARATION,
            name: name,
            returnType: returnTypeExpr,
            params: params,
            prefixModifiers: prefixModifiers,
            postfixModifiers: postfixModifiers,
            definition: definition,
        };
    }
}
