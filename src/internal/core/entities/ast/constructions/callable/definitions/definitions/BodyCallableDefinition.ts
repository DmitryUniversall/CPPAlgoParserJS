import BlockStatement from '../../../../statements/statements/BlockStatement';
import BaseCallableDefinition from '../BaseCallableDefinition';
import CallableDefinitionType from '../CallableDefinitionType';

export default interface BodyCallableDefinition extends BaseCallableDefinition {
    type: CallableDefinitionType.BODY;
    body: BlockStatement;
}
