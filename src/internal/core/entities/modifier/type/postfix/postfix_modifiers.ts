import PostfixTypeModifier from './modifiers/PostfixTypeModifier';
import PostfixTypeModifierKind from './modifiers/PostfixTypeModifierKind';

export const postfixTypeModifiers: Record<PostfixTypeModifierKind, PostfixTypeModifier> = {
    [PostfixTypeModifierKind.PTR]: { kind: PostfixTypeModifierKind.PTR, literal: '*' },
    [PostfixTypeModifierKind.REF]: { kind: PostfixTypeModifierKind.REF, literal: '&' },
    [PostfixTypeModifierKind.CONST]: { kind: PostfixTypeModifierKind.CONST, literal: 'const' },
};

export const postfixTypeModifierLiteralsMap: Record<string, PostfixTypeModifier> = Object.entries(postfixTypeModifiers).reduce((acc: Record<string, PostfixTypeModifier>, [_, operator]) => {
    acc[operator.literal] = operator;
    return acc;
}, {});
