import Expression from '../../Expression';
import ExpressionType from '../../ExpressionType';
import BaseExpression from '../../BaseExpression';

export default interface DerefExpression extends BaseExpression {
    type: ExpressionType.DEREF_EXPRESSION;
    expr: Expression;
}
