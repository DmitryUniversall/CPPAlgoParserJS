import BaseExpression from '../../BaseExpression';
import ExpressionType from '../../ExpressionType';

export default interface NumberExpression extends BaseExpression {
    type: ExpressionType.NUMBER_EXPRESSION;
    number: string;
}
