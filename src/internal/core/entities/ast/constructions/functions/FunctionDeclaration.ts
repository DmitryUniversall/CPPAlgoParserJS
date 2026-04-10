import FunctionParameter from './params/FunctionParameter';
import QualifiedName from '../../../qualified_name/QualifiedName';
import TypeExpression from '../../type/TypeExpression';
import FunctionDefinition from './FunctionDefinition';

export default interface FunctionDeclaration {
    name: QualifiedName;
    returnType: TypeExpression;
    params: FunctionParameter[];
    definition: FunctionDefinition | null;
}
