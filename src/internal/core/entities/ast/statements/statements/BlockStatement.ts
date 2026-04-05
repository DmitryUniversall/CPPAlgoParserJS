import BaseStatement from '../BaseStatement';
import StatementType from '../StatementType';
import Statement from '../Statement';

export default interface BlockStatement extends BaseStatement {
    type: StatementType.BLOCK_STATEMENT;
    body: Statement[];
}
