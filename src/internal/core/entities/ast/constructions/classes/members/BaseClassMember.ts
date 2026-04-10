import ClassMemberType from './ClassMemberType';
import AccessModifierType from '../../../../modifier/access/AccessModifierType';

export default interface BaseClassMember {
    type: ClassMemberType;
    accessModifier: AccessModifierType;
}
