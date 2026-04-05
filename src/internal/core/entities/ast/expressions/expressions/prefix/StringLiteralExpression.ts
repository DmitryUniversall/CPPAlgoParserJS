import BaseExpression from '../../BaseExpression';
import ExpressionType from '../../ExpressionType';

export default interface StringLiteralExpression extends BaseExpression {
    type: ExpressionType.STRING_LITERAL_EXPRESSION;
    literal: string;
}
