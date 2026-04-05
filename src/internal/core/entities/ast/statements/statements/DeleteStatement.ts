import BaseStatement from '../BaseStatement';
import StatementType from '../StatementType';
import Expression from '../../expressions/Expression';

export default interface DeleteStatement extends BaseStatement {
    type: StatementType.DELETE_STATEMENT;
    deleted: Expression;
}
