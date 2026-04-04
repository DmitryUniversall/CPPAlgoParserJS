import PostfixTypeModifierKind from './PostfixTypeModifierKind';

export default interface PostfixTypeModifier {
    kind: PostfixTypeModifierKind;
    literal: string;
}
