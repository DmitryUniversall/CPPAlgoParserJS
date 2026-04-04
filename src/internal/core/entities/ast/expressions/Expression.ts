import ExpressionType from './ExpressionType';
import ASTEntity from '../ASTEntity';
import ASTNodeType from '../ASTNodeType';

export default interface Expression extends ASTEntity {
    nodeType: ASTNodeType.EXPRESSION;
    type: ExpressionType;
}
