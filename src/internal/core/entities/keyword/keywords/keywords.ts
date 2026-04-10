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

    [KeywordType.CLASS]: { type: KeywordType.CLASS, kind: KeywordKind.DECLARATION, literal: 'class' },

    [KeywordType.PUBLIC]: { type: KeywordType.PUBLIC, kind: KeywordKind.MODIFIER, literal: 'public' },
    [KeywordType.PRIVATE]: { type: KeywordType.PRIVATE, kind: KeywordKind.MODIFIER, literal: 'private' },
    [KeywordType.PROTECTED]: { type: KeywordType.PROTECTED, kind: KeywordKind.MODIFIER, literal: 'protected' },

    [KeywordType.VIRTUAL]: { type: KeywordType.VIRTUAL, kind: KeywordKind.MODIFIER, literal: 'virtual' },

    [KeywordType.NULLPTR]: { type: KeywordType.NULLPTR, kind: KeywordKind.EXPRESSION, literal: 'nullptr' },
    [KeywordType.BREAK]: { type: KeywordType.BREAK, kind: KeywordKind.EXPRESSION, literal: 'break' },
    [KeywordType.CONTINUE]: { type: KeywordType.CONTINUE, kind: KeywordKind.EXPRESSION, literal: 'continue' },
};

export const keywordLiteralsMap: Record<string, Keyword> = Object.entries(keywords).reduce((acc: Record<string, Keyword>, [_, keyword]) => {
    acc[keyword.literal] = keyword;
    return acc;
}, {});
