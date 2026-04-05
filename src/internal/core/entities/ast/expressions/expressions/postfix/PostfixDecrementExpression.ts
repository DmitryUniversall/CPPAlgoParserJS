import BaseExpression from '../../BaseExpression';
import Expression from '../../Expression';
import ExpressionType from '../../ExpressionType';

export default interface PostfixDecrementExpression extends BaseExpression {
    type: ExpressionType.POSTFIX_DECREMENT_EXPRESSION;
    expr: Expression;
}
