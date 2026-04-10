import ClassMember from './members/ClassMember';
import ClassInheritance from './inheritance/ClassInheritance';

export default interface ClassDefinition {
    inheritance: ClassInheritance | null;
    members: ClassMember[];
}
