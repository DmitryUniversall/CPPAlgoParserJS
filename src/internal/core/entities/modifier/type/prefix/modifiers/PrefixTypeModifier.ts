import PrefixTypeModifierKind from './PrefixTypeModifierKind';

export default interface PrefixTypeModifier {
    kind: PrefixTypeModifierKind;
    literal: string;
}
