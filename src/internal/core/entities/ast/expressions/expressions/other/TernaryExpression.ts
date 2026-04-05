import BaseExpression from '../../BaseExpression';
import Expression from '../../Expression';
import ExpressionType from '../../ExpressionType';

export default interface TernaryExpression extends BaseExpression {
    type: ExpressionType.TERNARY_EXPRESSION;
    condition: Expression;
    thenExpr: Expression;
    elseExpr: Expression;
}
