export const KEYWORDS = {
    IF: { type: 'IF', literal: 'if' },
    ELSE: { type: 'ELSE', literal: 'else' },
    FOR: { type: 'FOR', literal: 'for' },
    WHILE: { type: 'WHILE', literal: 'while' },
    DELETE: { type: 'DELETE', literal: 'delete' },
    NULLPTR: { type: 'NULLPTR', literal: 'nullptr' },
    NEW: { type: 'NEW', literal: 'new' },
};

export const keywordLiteralsMap = Object.entries(KEYWORDS).reduce((acc, [_, keyword]) => {
    acc[keyword.literal] = keyword;
    return acc;
}, {});
