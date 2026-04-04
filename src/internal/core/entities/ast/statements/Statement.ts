import StatementType from './StatementType';
import ASTEntity from '../ASTEntity';
import ASTNodeType from '../ASTNodeType';

export default interface Statement extends ASTEntity {
    nodeType: ASTNodeType.STATEMENT;
    type: StatementType;
}
