import PrefixTypeModifierKind from './modifiers/PrefixTypeModifierKind';
import PrefixTypeModifier from './modifiers/PrefixTypeModifier';

export const prefixTypeModifiers: Record<PrefixTypeModifierKind, PrefixTypeModifier> = {
    [PrefixTypeModifierKind.CONST]: { kind: PrefixTypeModifierKind.CONST, literal: 'const'},
    [PrefixTypeModifierKind.STATIC]: { kind: PrefixTypeModifierKind.STATIC, literal: 'static'},
    [PrefixTypeModifierKind.UNSIGNED]: { kind: PrefixTypeModifierKind.UNSIGNED, literal: 'unsigned'},
    [PrefixTypeModifierKind.SIGNED]: { kind: PrefixTypeModifierKind.SIGNED, literal: 'signed'},
    [PrefixTypeModifierKind.LONG]: { kind: PrefixTypeModifierKind.LONG, literal: 'long'},
    [PrefixTypeModifierKind.SHORT]: { kind: PrefixTypeModifierKind.SHORT, literal: 'short'},
}

export const prefixTypeModifierLiteralsMap: Record<string, PrefixTypeModifier> = Object.entries(prefixTypeModifiers).reduce((acc: Record<string, PrefixTypeModifier>, [_, operator]) => {
    acc[operator.literal] = operator;
    return acc;
}, {});
