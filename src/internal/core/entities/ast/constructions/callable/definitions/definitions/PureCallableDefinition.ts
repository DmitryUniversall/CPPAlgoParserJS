import BaseCallableDefinition from '../BaseCallableDefinition';
import CallableDefinitionType from '../CallableDefinitionType';

export default interface PureCallableDefinition extends BaseCallableDefinition {
    type: CallableDefinitionType.PURE;
}
