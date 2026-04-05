import BaseExpression from '../../BaseExpression';
import Expression from '../../Expression';
import ExpressionType from '../../ExpressionType';

export default interface ConstructorCallExpression extends BaseExpression {
    type: ExpressionType.CONSTRUCTOR_CALL_EXPRESSION;
    varName: string;
    args: Expression[];
}
