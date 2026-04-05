import BaseExpression from '../../BaseExpression';
import Expression from '../../Expression';
import ExpressionType from '../../ExpressionType';

export default interface AssignmentExpression extends BaseExpression {
    type: ExpressionType.ASSIGNMENT_EXPRESSION;
    left: Expression;
    right: Expression;
}
