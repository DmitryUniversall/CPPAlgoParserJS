import BaseExpression from '../../BaseExpression';
import Expression from '../../Expression';
import ExpressionType from '../../ExpressionType';

export default interface PostfixIncrementExpression extends BaseExpression {
    type: ExpressionType.POSTFIX_INCREMENT_EXPRESSION;
    expr: Expression;
}
