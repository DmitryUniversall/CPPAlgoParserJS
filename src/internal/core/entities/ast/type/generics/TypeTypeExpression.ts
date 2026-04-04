import TypeExpression from '../TypeExpression';
import PrefixTypeModifier from '../../../modifier/type/prefix/PrefixTypeModifier';
import PostfixTypeModifier from '../../../modifier/type/postfix/PostfixTypeModifier';

export default interface TypeTypeExpression extends TypeExpression {
    typeName: string;
    prefixModifiers: PrefixTypeModifier[];
    typeParameters: TypeTypeExpression[];
    postfixModifiers: PostfixTypeModifier[];
}
