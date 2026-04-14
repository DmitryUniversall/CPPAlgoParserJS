import BaseStatement from '../../BaseStatement';
import StatementType from '../../StatementType';
import BlockStatement from '../BlockStatement';
import ForStatementKind from './ForStatementKind';

export default interface BaseForStatement extends BaseStatement {
    type: StatementType.FOR_STATEMENT;
    kind: ForStatementKind;
    body: BlockStatement;
}
