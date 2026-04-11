import TopLevelFunctionDeclaration from './declarations/TopLevelFunctionDeclaration';
import TopLevelVariableDeclaration from './declarations/TopLevelDeclarationStatement';
import TopLevelClassDeclaration from './declarations/TopLevelClassDeclaration';

type TopLevelDeclaration = TopLevelFunctionDeclaration | TopLevelVariableDeclaration | TopLevelClassDeclaration;

export default TopLevelDeclaration;
