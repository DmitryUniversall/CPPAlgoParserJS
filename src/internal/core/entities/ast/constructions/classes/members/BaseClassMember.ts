import ClassMemberType from './ClassMemberType';
import AccessModifierType from '../../../../modifier/access/AccessModifierType';
import ASTNodeType from '../../../ASTNodeType';

export default interface BaseClassMember {
    nodeType: ASTNodeType.DECLARATION;
    type: ClassMemberType;
    accessModifier: AccessModifierType;
}
