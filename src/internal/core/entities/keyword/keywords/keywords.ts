import Keyword from '../Keyword';
import KeywordType from '../KeywordType';
import KeywordKind from '../KeywordKind';

export const keywords: Record<KeywordType, Keyword> = {
    [KeywordType.IF]: { type: KeywordType.IF, kind: KeywordKind.CONTROL, literal: 'if' },
    [KeywordType.ELSE]: { type: KeywordType.ELSE, kind: KeywordKind.CONTROL, literal: 'else' },
    [KeywordType.FOR]: { type: KeywordType.FOR, kind: KeywordKind.CONTROL, literal: 'for' },
    [KeywordType.WHILE]: { type: KeywordType.WHILE, kind: KeywordKind.CONTROL, literal: 'while' },
    [KeywordType.DO]: { type: KeywordType.DO, kind: KeywordKind.CONTROL, literal: 'do' },

    [KeywordType.DELETE]: { type: KeywordType.DELETE, kind: KeywordKind.ACTION, literal: 'delete' },
    [KeywordType.NEW]: { type: KeywordType.NEW, kind: KeywordKind.ACTION, literal: 'new' },

    [KeywordType.CONST]: { type: KeywordType.CONST, kind: KeywordKind.MODIFIER, literal: 'const' },

    [KeywordType.NULLPTR]: { type: KeywordType.NULLPTR, kind: KeywordKind.EXPRESSION, literal: 'nullptr' },
};

export const keywordLiteralsMap: Record<string, Keyword> = Object.entries(keywords).reduce((acc: Record<string, Keyword>, [_, keyword]) => {
    acc[keyword.literal] = keyword;
    return acc;
}, {});
