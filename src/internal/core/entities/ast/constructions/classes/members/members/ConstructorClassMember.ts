import BaseClassMember from '../BaseClassMember';
import ClassMemberType from '../ClassMemberType';
import ConstructorDeclaration from '../../constructors/ConstructorDeclaration';

export default interface ConstructorClassMember extends BaseClassMember {
    type: ClassMemberType.CONSTRUCTOR;
    constructorDeclaration: ConstructorDeclaration;
}
