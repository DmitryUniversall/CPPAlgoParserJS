import BaseExpression from '../../BaseExpression';
import ExpressionType from '../../ExpressionType';

export default interface IdentExpression extends BaseExpression {
    type: ExpressionType.IDENT_EXPRESSION;
    identifier: string;
}
