import BaseTopLevelDeclaration from '../BaseTopLevelDeclaration';
import TopLevelDeclarationType from '../TopLevelDeclarationType';
import DeclarationStatement from '../../statements/statements/declaration/DeclarationStatement';

export default interface TopLevelDeclarationStatement extends BaseTopLevelDeclaration {
    type: TopLevelDeclarationType.DECLARATION_STATEMENT;
    statement: DeclarationStatement;
}
