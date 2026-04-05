import BaseStatement from '../BaseStatement';
import StatementType from '../StatementType';
import Expression from '../../expressions/Expression';

export default interface ExpressionStatement extends BaseStatement {
    type: StatementType.EXPRESSION_STATEMENT;
    expr: Expression;
}
