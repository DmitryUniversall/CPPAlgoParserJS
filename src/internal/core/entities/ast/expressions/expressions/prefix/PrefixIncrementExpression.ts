import BaseExpression from '../../BaseExpression';
import Expression from '../../Expression';
import ExpressionType from '../../ExpressionType';

export default interface PrefixIncrementExpression extends BaseExpression {
    type: ExpressionType.PREFIX_INCREMENT_EXPRESSION;
    expr: Expression;
}
