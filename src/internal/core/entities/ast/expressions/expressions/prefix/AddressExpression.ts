import BaseExpression from '../../BaseExpression';
import Expression from '../../Expression';
import ExpressionType from '../../ExpressionType';

export default interface AddressExpression extends BaseExpression {
    type: ExpressionType.ADDRESS_EXPRESSION;
    expr: Expression;
}
