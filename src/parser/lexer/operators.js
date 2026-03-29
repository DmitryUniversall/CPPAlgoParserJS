export const OPERATORS = {
    PLUS: { type: 'PLUS', literal: '+', infix: { precedence: 6 } },
    MINUS: { type: 'MINUS', literal: '-', infix: { precedence: 6 }, prefix: { precedence: 8 } },
    STAR: { type: 'STAR', literal: '*', infix: { precedence: 7 }, prefix: { precedence: 8 } },
    SLASH: { type: 'SLASH', literal: '/', infix: { precedence: 7 } },
    INC: { type: 'INC', literal: '++', prefix: { precedence: 8 }, postfix: { precedence: 8 } },
    DEC: { type: 'DEC', literal: '--', prefix: { precedence: 8 }, postfix: { precedence: 8 } },

    EQ: { type: 'EQ', literal: '==', infix: { precedence: 4 } },
    NEQ: { type: 'NEQ', literal: '!=', infix: { precedence: 4 } },
    LT: { type: 'LT', literal: '<', infix: { precedence: 5 } },
    GT: { type: 'GT', literal: '>', infix: { precedence: 5 } },
    LTE: { type: 'LTE', literal: '<=', infix: { precedence: 5 } },
    GTE: { type: 'GTE', literal: '>=', infix: { precedence: 5 } },

    AND: { type: 'AND', literal: '&&', infix: { precedence: 3 } },
    OR: { type: 'OR', literal: '||', infix: { precedence: 2 } },
    BIT_AND: { type: 'BIT_AND', literal: '&', prefix: { precedence: 8 } },

    ASSIGN: { type: 'ASSIGN', literal: '=', infix: { precedence: 1, assoc: 'right' } },
    ARROW: { type: 'ARROW', literal: '->', postfix: { precedence: 9 } },
    DOT: { type: 'DOT', literal: '.', postfix: { precedence: 9 } },

    SHL: { type: 'SHL', literal: '<<', infix: { precedence: 5 } },
    SHR: { type: 'SHR', literal: '>>', infix: { precedence: 5 } },

    TERN: { literal: '?', infix: { precedence: 2, assoc: 'right' } },
};

export const operatorLiteralsMap = Object.entries(OPERATORS).reduce((acc, [_, operator]) => {
    acc[operator.literal] = operator;
    return acc;
}, {});
