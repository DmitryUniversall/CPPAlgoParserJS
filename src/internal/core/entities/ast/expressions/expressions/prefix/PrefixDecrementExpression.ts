import BaseExpression from '../../BaseExpression';
import Expression from '../../Expression';
import ExpressionType from '../../ExpressionType';

export default interface PrefixDecrementExpression extends BaseExpression {
    type: ExpressionType.PREFIX_DECREMENT_EXPRESSION;
    expr: Expression;
}
