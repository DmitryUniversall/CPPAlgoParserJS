import BaseClassMember from '../BaseClassMember';
import DestructorDeclaration from '../../destructors/DestructorDeclaration';
import ClassMemberType from '../ClassMemberType';

export default interface DestructorClassMember extends BaseClassMember {
    type: ClassMemberType.DESTRUCTOR;
    destructorDeclaration: DestructorDeclaration;
}
