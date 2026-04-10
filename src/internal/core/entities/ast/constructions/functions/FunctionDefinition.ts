import DefaultFunctionDefinition from './definitions/DefaultFunctionDefinition';
import BodyFunctionDefinition from './definitions/BodyFunctionDefinition';
import DeleteFunctionDefinition from './definitions/DeleteFunctionDefinition';

type FunctionDefinition = DefaultFunctionDefinition | BodyFunctionDefinition | DeleteFunctionDefinition;

export default FunctionDefinition;
