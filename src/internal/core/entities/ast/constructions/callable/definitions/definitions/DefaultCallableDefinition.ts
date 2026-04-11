import BaseCallableDefinition from '../BaseCallableDefinition';
import CallableDefinitionType from '../CallableDefinitionType';

export default interface DefaultCallableDefinition extends BaseCallableDefinition {
    type: CallableDefinitionType.DEFAULT;
}
