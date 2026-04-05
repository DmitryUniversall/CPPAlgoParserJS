import ASTEntity from '../ASTEntity';
import ExpressionType from './ExpressionType';
import ASTNodeType from '../ASTNodeType';

export default interface BaseExpression extends ASTEntity {
    nodeType: ASTNodeType.EXPRESSION;
    type: ExpressionType;
}
