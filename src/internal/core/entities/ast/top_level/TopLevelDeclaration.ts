import TopLevelFunctionDefinition from './declarations/TopLevelFunctionDefinition';
import TopLevelVariableDeclaration from './declarations/TopLevelDeclarationStatement';
import TopLevelClassDeclaration from './declarations/TopLevelClassDeclaration';

type TopLevelDeclaration = TopLevelFunctionDefinition | TopLevelVariableDeclaration | TopLevelClassDeclaration;

export default TopLevelDeclaration;
