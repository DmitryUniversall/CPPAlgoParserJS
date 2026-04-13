import BaseExpression from '../../BaseExpression';
import Expression from '../../Expression';
import ExpressionType from '../../ExpressionType';
import TypeExpression from '../../../type/TypeExpression';

export default interface CallExpression extends BaseExpression {
    type: ExpressionType.CALL_EXPRESSION;
    called: Expression;
    args: Expression[];
    typeArgs?: TypeExpression[];
}
