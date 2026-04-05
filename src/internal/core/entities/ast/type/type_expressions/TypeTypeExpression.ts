import PrefixTypeModifier from '../../../modifier/type/prefix/PrefixTypeModifier';
import PostfixTypeModifier from '../../../modifier/type/postfix/PostfixTypeModifier';
import BaseTypeExpression from '../BaseTypeExpression';

export default interface TypeTypeExpression extends BaseTypeExpression {
    typeName: string;
    prefixModifiers: PrefixTypeModifier[];
    typeParameters: TypeTypeExpression[];
    postfixModifiers: PostfixTypeModifier[];
}
