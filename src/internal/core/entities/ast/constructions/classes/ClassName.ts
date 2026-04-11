import TypeExpression from '../../type/TypeExpression';
import QualifiedName from '../../../qualified_name/QualifiedName';

export default interface ClassName {
    name: QualifiedName;
    genericParams: TypeExpression[];
}
