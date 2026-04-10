import ConstructorClassMember from './members/ConstructorClassMember';
import FieldClassMember from './members/FieldClassMember';
import MethodClassMember from './members/MethodClassMember';
import NestedClassClassMember from './members/NestedClassClassMember';

type ClassMember = ConstructorClassMember | FieldClassMember | MethodClassMember | NestedClassClassMember;

export default ClassMember;
