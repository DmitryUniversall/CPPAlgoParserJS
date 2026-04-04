import TypeExpressionType from './TypeExpressionType';
import ASTEntity from '../ASTEntity';
import ASTNodeType from '../ASTNodeType';

export default interface TypeExpression extends ASTEntity {
    nodeType: ASTNodeType.TYPE;
    type: TypeExpressionType;
}
