import TopLevelDeclarationType from '../TopLevelDeclarationType';
import BaseTopLevelDeclaration from '../BaseTopLevelDeclaration';
import FunctionDeclaration from '../../constructions/functions/FunctionDeclaration';

export default interface TopLevelFunctionDefinition extends BaseTopLevelDeclaration {
    type: TopLevelDeclarationType.FUNCTION_DECLARATION;
    declaration: FunctionDeclaration;
}
