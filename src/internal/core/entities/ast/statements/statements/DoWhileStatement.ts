import BaseStatement from '../BaseStatement';
import StatementType from '../StatementType';
import Expression from '../../expressions/Expression';
import BlockStatement from './BlockStatement';

export default interface DoWhileStatement extends BaseStatement {
    type: StatementType.DO_WHILE_STATEMENT;
    condition: Expression;
    body: BlockStatement;
}
