import BaseClassMember from '../BaseClassMember';
import ClassMemberType from '../ClassMemberType';
import ClassDeclaration from '../../ClassDeclaration';

export default interface NestedClassClassMember extends BaseClassMember {
    type: ClassMemberType.NESTED_CLASS;
    classDefinition: ClassDeclaration;
}
