import BaseExpression from '../../BaseExpression';
import Expression from '../../Expression';
import ExpressionType from '../../ExpressionType';
import Operator from '../../../../operator/Operator';

export default interface BinaryOperationExpression extends BaseExpression {
    type: ExpressionType.BINARY_OPERATION_EXPRESSION;
    operator: Operator;
    left: Expression;
    right: Expression;
}
