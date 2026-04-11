import QualifiedName from '../../../../qualified_name/QualifiedName';
import TypeExpression from '../../../type/TypeExpression';
import CallableParameter from '../../callable/params/CallableParameter';
import CallablePrefixModifierType from '../../callable/modifiers/CallablePrefixModifierType';
import CallablePostfixModifierType from '../../callable/modifiers/CallablePostfixModifierType';
import CallableDefinition from '../../callable/definitions/CallableDefinition';
import MethodPostfixModifierType from './modifiers/MethodModifierType';
import AccessModifierType from '../../../../modifier/access/AccessModifierType';
import ASTNodeType from '../../../ASTNodeType';

export default interface MethodDeclaration {
    nodeType: ASTNodeType.DECLARATION;
    accessModifier: AccessModifierType;
    name: QualifiedName;
    returnType: TypeExpression;
    params: CallableParameter[];
    callablePrefixModifiers: CallablePrefixModifierType[];
    callablePostfixModifiers: CallablePostfixModifierType[];
    methodPostfixModifiers: MethodPostfixModifierType[];
    definition: CallableDefinition | null;
}
