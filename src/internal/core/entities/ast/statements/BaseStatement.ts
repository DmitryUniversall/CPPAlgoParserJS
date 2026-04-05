import StatementType from './StatementType';
import ASTEntity from '../ASTEntity';
import ASTNodeType from '../ASTNodeType';

export default interface BaseStatement extends ASTEntity {
    nodeType: ASTNodeType.STATEMENT;
    type: StatementType;
}
