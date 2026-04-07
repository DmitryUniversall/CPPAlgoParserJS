import FunctionDefinition from './declarations/FunctionDefinition';
import TopLevelDeclarationStatement from './declarations/TopLevelDeclarationStatement';
import MethodDefinition from './declarations/MethodDefinition';

type TopLevelDeclaration = FunctionDefinition | MethodDefinition | TopLevelDeclarationStatement;

export default TopLevelDeclaration;
