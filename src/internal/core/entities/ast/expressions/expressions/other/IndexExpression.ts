import BaseExpression from '../../BaseExpression';
import Expression from '../../Expression';
import ExpressionType from '../../ExpressionType';

export default interface IndexExpression extends BaseExpression {
    type: ExpressionType.INDEX_EXPRESSION;
    owner: Expression;
    index: Expression;
}
