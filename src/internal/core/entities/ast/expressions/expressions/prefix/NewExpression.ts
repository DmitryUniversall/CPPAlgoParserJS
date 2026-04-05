import BaseExpression from '../../BaseExpression';
import ExpressionType from '../../ExpressionType';
import TypeExpression from '../../../type/TypeExpression';

export default interface NewExpression extends BaseExpression {
    type: ExpressionType.NEW_EXPRESSION;
    typeExpr: TypeExpression;
}
