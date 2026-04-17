import BaseStatement from '../BaseStatement';
import StatementType from '../StatementType';
import Expression from '../../expressions/Expression';

export default interface ReturnStatement extends BaseStatement {
    type: StatementType.RETURN_STATEMENT;
    returned: Expression | null;
}
