import BaseExpression from '../../BaseExpression';
import Expression from '../../Expression';
import ExpressionType from '../../ExpressionType';

export default interface PtrMemberExpression extends BaseExpression {
    type: ExpressionType.PTR_MEMBER_EXPRESSION;
    owner: Expression;
    field: string;
}
