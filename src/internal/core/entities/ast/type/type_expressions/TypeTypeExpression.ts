import PrefixTypeModifier from '../../../modifier/type/prefix/modifiers/PrefixTypeModifier';
import PostfixTypeModifier from '../../../modifier/type/postfix/modifiers/PostfixTypeModifier';
import BaseTypeExpression from '../BaseTypeExpression';
import QualifiedName from '../../../qualified_name/QualifiedName';

export default interface TypeTypeExpression extends BaseTypeExpression {
    typeName: QualifiedName;
    prefixModifiers: PrefixTypeModifier[];
    typeParameters: TypeTypeExpression[];
    postfixModifiers: PostfixTypeModifier[];
}
