import DefaultCallableDefinition from './definitions/DefaultCallableDefinition';
import BodyCallableDefinition from './definitions/BodyCallableDefinition';
import DeleteCallableDefinition from './definitions/DeleteCallableDefinition';
import PureCallableDefinition from './definitions/PureCallableDefinition';

type CallableDefinition = DefaultCallableDefinition | BodyCallableDefinition | DeleteCallableDefinition | PureCallableDefinition;

export default CallableDefinition;
