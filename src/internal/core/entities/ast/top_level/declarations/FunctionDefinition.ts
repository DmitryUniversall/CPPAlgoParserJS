import FunctionParameter from './FunctionParameter';
import BlockStatement from '../../statements/statements/BlockStatement';
import TypeExpression from '../../type/TypeExpression';
import TopLevelDeclarationType from '../TopLevelDeclarationType';
import BaseTopLevelDeclaration from '../BaseTopLevelDeclaration';
import QualifiedName from '../../../qualified_name/QualifiedName';

export default interface FunctionDefinition extends BaseTopLevelDeclaration {
    type: TopLevelDeclarationType.FUNCTION_DEFINITION;
    name: QualifiedName;
    returnType: TypeExpression;
    params: FunctionParameter[];
    body: BlockStatement;
}
