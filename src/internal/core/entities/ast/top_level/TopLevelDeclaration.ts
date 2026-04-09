import FunctionDefinition from './declarations/FunctionDefinition';
import TopLevelDeclarationStatement from './declarations/TopLevelDeclarationStatement';

type TopLevelDeclaration = FunctionDefinition | TopLevelDeclarationStatement;

export default TopLevelDeclaration;
