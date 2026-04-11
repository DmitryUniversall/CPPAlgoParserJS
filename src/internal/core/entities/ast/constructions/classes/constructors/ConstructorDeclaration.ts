import ASTNodeType from '../../../ASTNodeType';
import AccessModifierType from '../../../../modifier/access/AccessModifierType';
import CallableParameter from '../../callable/params/CallableParameter';
import CallablePrefixModifierType from '../../callable/modifiers/CallablePrefixModifierType';
import CallablePostfixModifierType from '../../callable/modifiers/CallablePostfixModifierType';
import MethodPostfixModifierType from '../methods/modifiers/MethodModifierType';
import ClassName from '../ClassName';
import ConstructorDefinition from './ConstructorDefinition';

export default interface ConstructorDeclaration {
    nodeType: ASTNodeType.DECLARATION;
    accessModifier: AccessModifierType;
    name: ClassName;
    params: CallableParameter[];
    callablePrefixModifiers: CallablePrefixModifierType[];
    callablePostfixModifiers: CallablePostfixModifierType[];
    methodPostfixModifiers: MethodPostfixModifierType[];
    definition: ConstructorDefinition;
}
