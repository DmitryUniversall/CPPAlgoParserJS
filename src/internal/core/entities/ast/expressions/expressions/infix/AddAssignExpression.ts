import BaseExpression from '../../BaseExpression';
import Expression from '../../Expression';
import ExpressionType from '../../ExpressionType';

export default interface AddAssignExpression extends BaseExpression {
    type: ExpressionType.ADD_ASSIGN_EXPRESSION;
    left: Expression;
    right: Expression;
}
