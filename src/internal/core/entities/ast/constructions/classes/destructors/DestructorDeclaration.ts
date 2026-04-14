import AccessModifierType from '../../../../modifier/access/AccessModifierType';
import ClassName from '../ClassName';
import CallablePrefixModifierType from '../../callable/modifiers/CallablePrefixModifierType';
import CallablePostfixModifierType from '../../callable/modifiers/CallablePostfixModifierType';
import MethodPostfixModifierType from '../methods/modifiers/MethodModifierType';
import ASTNodeType from '../../../ASTNodeType';
import DestructorDefinition from './DestructorDefinition';

export default interface DestructorDeclaration {
    nodeType: ASTNodeType.DECLARATION;
    accessModifier: AccessModifierType;
    name: ClassName;
    callablePrefixModifiers: CallablePrefixModifierType[];
    callablePostfixModifiers: CallablePostfixModifierType[];
    methodPostfixModifiers: MethodPostfixModifierType[];
    definition: DestructorDefinition;
}
