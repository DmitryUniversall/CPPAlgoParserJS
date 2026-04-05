import BaseExpression from '../../BaseExpression';
import Expression from '../../Expression';
import ExpressionType from '../../ExpressionType';

export default interface MemberExpression extends BaseExpression {
    type: ExpressionType.MEMBER_EXPRESSION;
    owner: Expression;
    field: string;
}
