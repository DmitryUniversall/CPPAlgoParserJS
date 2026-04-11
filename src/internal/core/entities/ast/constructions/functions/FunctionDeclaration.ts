import QualifiedName from '../../../qualified_name/QualifiedName';
import TypeExpression from '../../type/TypeExpression';
import CallableParameter from '../callable/params/CallableParameter';
import CallablePrefixModifierType from '../callable/modifiers/CallablePrefixModifierType';
import CallablePostfixModifierType from '../callable/modifiers/CallablePostfixModifierType';
import CallableDefinition from '../callable/definitions/CallableDefinition';
import ASTNodeType from '../../ASTNodeType';

export default interface FunctionDeclaration {
    nodeType: ASTNodeType.DECLARATION;
    name: QualifiedName;
    returnType: TypeExpression;
    params: CallableParameter[];
    prefixModifiers: CallablePrefixModifierType[];
    postfixModifiers: CallablePostfixModifierType[];
    definition: CallableDefinition | null;
}
