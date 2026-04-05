import BaseExpression from '../../BaseExpression';
import Expression from '../../Expression';
import ExpressionType from '../../ExpressionType';

export default interface MinusAssignExpression extends BaseExpression {
    type: ExpressionType.MINUS_ASSIGN_EXPRESSION;
    left: Expression;
    right: Expression;
}
