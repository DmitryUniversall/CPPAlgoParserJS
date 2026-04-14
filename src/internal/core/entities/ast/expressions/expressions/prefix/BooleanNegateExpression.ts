import BaseExpression from '../../BaseExpression';
import Expression from '../../Expression';
import ExpressionType from '../../ExpressionType';

export default interface BooleanNegateExpression extends BaseExpression {
    type: ExpressionType.BOOLEAN_NEGATE_EXPRESSION;
    expr: Expression;
}
