import BaseExpression from '../../BaseExpression';
import Expression from '../../Expression';
import ExpressionType from '../../ExpressionType';

export default interface ScopeResolutionExpression extends BaseExpression {
    type: ExpressionType.SCOPE_RESOLUTION_EXPRESSION;
    scope: Expression;
    field: string;
}
