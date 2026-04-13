import QualifiedName from '../qualified_name/QualifiedName';
import TypeExpression from '../ast/type/TypeExpression';

export default interface GenericName {
    name: QualifiedName;
    typeParams: TypeExpression[];
}
