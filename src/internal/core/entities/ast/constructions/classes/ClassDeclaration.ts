import ClassDefinition from './ClassDefinition';
import ClassName from './ClassName';
import ASTNodeType from '../../ASTNodeType';

export default interface ClassDeclaration {
    nodeType: ASTNodeType.DECLARATION;
    className: ClassName;
    definition: ClassDefinition | null;
}
