import BaseCallableDefinition from '../BaseCallableDefinition';
import CallableDefinitionType from '../CallableDefinitionType';

export default interface DeleteCallableDefinition extends BaseCallableDefinition {
    type: CallableDefinitionType.DELETE;
}
