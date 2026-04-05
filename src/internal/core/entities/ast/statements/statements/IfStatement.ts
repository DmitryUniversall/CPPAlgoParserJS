import BaseStatement from '../BaseStatement';
import StatementType from '../StatementType';
import Expression from '../../expressions/Expression';
import BlockStatement from './BlockStatement';

export default interface IfStatement extends BaseStatement {
    type: StatementType.IF_STATEMENT;
    condition: Expression;
    thenStmt: BlockStatement;
    elseStmt: BlockStatement | null;
}
