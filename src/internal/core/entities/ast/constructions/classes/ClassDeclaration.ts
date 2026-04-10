import ClassDefinition from './ClassDefinition';
import ClassName from './ClassName';

export default interface ClassDeclaration {
    className: ClassName;
    definition: ClassDefinition | null;
}
