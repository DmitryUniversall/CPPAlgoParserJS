import FunctionParameter from './params/FunctionParameter';
import QualifiedName from '../../../qualified_name/QualifiedName';
import TypeExpression from '../../type/TypeExpression';
import BaseFunctionDefinition from './BaseFunctionDefinition';
import FunctionPostfixModifierType from './modifiers/FunctionPostfixModifierType';
import FunctionPrefixModifierType from './modifiers/FunctionPrefixModifierType';

export default interface FunctionDeclaration {
    name: QualifiedName;
    returnType: TypeExpression;
    params: FunctionParameter[];
    prefixModifiers: FunctionPrefixModifierType[];
    postfixModifiers: FunctionPostfixModifierType[];
    definition: BaseFunctionDefinition | null;
}
