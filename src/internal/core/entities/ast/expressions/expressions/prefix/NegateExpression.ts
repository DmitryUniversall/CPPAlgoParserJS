import BaseExpression from '../../BaseExpression';
import Expression from '../../Expression';
import ExpressionType from '../../ExpressionType';

export default interface NegateExpression extends BaseExpression {
    type: ExpressionType.NEGATE_EXPRESSION;
    expr: Expression;
}
