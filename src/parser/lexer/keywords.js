export const KEYWORDS = {
    IF: { type: 'IF', literal: 'if' },
    ELSE: { type: 'ELSE', literal: 'else' },
    FOR: { type: 'FOR', literal: 'for' },
    WHILE: { type: 'WHILE', literal: 'while' },
    DELETE: { type: 'DELETE', literal: 'delete' },
    NULLPTR: { type: 'NULLPTR', literal: 'nullptr' },
};

export const keywordLiteralsMap = Object.entries(KEYWORDS).reduce((acc, [_, config]) => {
    acc[config.literal] = config;
    return acc;
}, {});
