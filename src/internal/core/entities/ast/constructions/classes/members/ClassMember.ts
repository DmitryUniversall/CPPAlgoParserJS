import ConstructorClassMember from './members/ConstructorClassMember';
import FieldClassMember from './members/FieldClassMember';
import MethodClassMember from './members/MethodClassMember';
import NestedClassClassMember from './members/NestedClassClassMember';
import DestructorClassMember from './members/DestructorClassMember';

type ClassMember = ConstructorClassMember | FieldClassMember | MethodClassMember | NestedClassClassMember | DestructorClassMember;

export default ClassMember;
