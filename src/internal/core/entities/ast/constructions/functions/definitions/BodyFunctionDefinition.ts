import BlockStatement from '../../../statements/statements/BlockStatement';
import BaseFunctionDefinition from '../BaseFunctionDefinition';

export default interface BodyFunctionDefinition extends BaseFunctionDefinition {
    body: BlockStatement;
}
