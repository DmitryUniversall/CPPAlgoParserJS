import BaseStatement from '../BaseStatement';
import StatementType from '../StatementType';
import Expression from '../../expressions/Expression';
import BlockStatement from './BlockStatement';

export default interface WhileStatement extends BaseStatement {
    type: StatementType.WHILE_STATEMENT;
    condition: Expression;
    body: BlockStatement;
}
