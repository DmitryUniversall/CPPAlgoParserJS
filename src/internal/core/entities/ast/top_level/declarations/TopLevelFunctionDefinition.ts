import TopLevelDeclarationType from '../TopLevelDeclarationType';
import BaseTopLevelDeclaration from '../BaseTopLevelDeclaration';
import CallableDeclaration from '../../constructions/callable/CallableDeclaration';

export default interface TopLevelFunctionDefinition extends BaseTopLevelDeclaration {
    type: TopLevelDeclarationType.FUNCTION_DECLARATION;
    declaration: CallableDeclaration;
}
