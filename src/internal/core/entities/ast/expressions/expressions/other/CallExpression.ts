import BaseExpression from '../../BaseExpression';
import Expression from '../../Expression';
import ExpressionType from '../../ExpressionType';

export default interface CallExpression extends BaseExpression {
    type: ExpressionType.CALL_EXPRESSION;
    called: Expression;
    args: Expression[];
}
