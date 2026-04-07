import ASTNodeType from '../ASTNodeType';
import TopLevelDeclarationType from './TopLevelDeclarationType';

export default interface BaseTopLevelDeclaration {
    nodeType: ASTNodeType.TOP_LEVEL_DECLARATION;
    type: TopLevelDeclarationType;
}
