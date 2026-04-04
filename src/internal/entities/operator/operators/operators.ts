import OperatorType from '../OperatorType';
import Operator from '../Operator';
import OperatorAssoc from '../OperatorAssoc';

export const operators: Record<OperatorType, Operator> = {
    [OperatorType.PLUS]: { type: OperatorType.PLUS, literal: '+', infix: { precedence: 6, assoc: OperatorAssoc.LEFT } },
    [OperatorType.MINUS]: { type: OperatorType.MINUS, literal: '-', infix: { precedence: 6, assoc: OperatorAssoc.LEFT }, prefix: { precedence: 8, assoc: OperatorAssoc.LEFT } },
    [OperatorType.STAR]: { type: OperatorType.STAR, literal: '*', infix: { precedence: 7, assoc: OperatorAssoc.LEFT }, prefix: { precedence: 8, assoc: OperatorAssoc.LEFT } },
    [OperatorType.SLASH]: { type: OperatorType.SLASH, literal: '/', infix: { precedence: 7, assoc: OperatorAssoc.LEFT } },
    [OperatorType.INC]: { type: OperatorType.INC, literal: '++', prefix: { precedence: 8, assoc: OperatorAssoc.LEFT }, postfix: { precedence: 8, assoc: OperatorAssoc.LEFT } },
    [OperatorType.DEC]: { type: OperatorType.DEC, literal: '--', prefix: { precedence: 8, assoc: OperatorAssoc.LEFT }, postfix: { precedence: 8, assoc: OperatorAssoc.LEFT } },

    [OperatorType.EQ]: { type: OperatorType.EQ, literal: '==', infix: { precedence: 4, assoc: OperatorAssoc.LEFT } },
    [OperatorType.NEQ]: { type: OperatorType.NEQ, literal: '!=', infix: { precedence: 4, assoc: OperatorAssoc.LEFT } },
    [OperatorType.LT]: { type: OperatorType.LT, literal: '<', infix: { precedence: 5, assoc: OperatorAssoc.LEFT } },
    [OperatorType.GT]: { type: OperatorType.GT, literal: '>', infix: { precedence: 5, assoc: OperatorAssoc.LEFT } },
    [OperatorType.LTE]: { type: OperatorType.LTE, literal: '<=', infix: { precedence: 5, assoc: OperatorAssoc.LEFT } },
    [OperatorType.GTE]: { type: OperatorType.GTE, literal: '>=', infix: { precedence: 5, assoc: OperatorAssoc.LEFT } },

    [OperatorType.AND]: { type: OperatorType.AND, literal: '&&', infix: { precedence: 3, assoc: OperatorAssoc.LEFT } },
    [OperatorType.OR]: { type: OperatorType.OR, literal: '||', infix: { precedence: 2, assoc: OperatorAssoc.LEFT } },

    [OperatorType.ARROW]: { type: OperatorType.ARROW, literal: '->', postfix: { precedence: 9, assoc: OperatorAssoc.LEFT } },
    [OperatorType.DOT]: { type: OperatorType.DOT, literal: '.', postfix: { precedence: 9, assoc: OperatorAssoc.LEFT } },
    [OperatorType.NAMESPACE_ACCESS]: { type: OperatorType.NAMESPACE_ACCESS, literal: '::', postfix: { precedence: 9, assoc: OperatorAssoc.LEFT } },

    [OperatorType.AMPERSAND]: { type: OperatorType.AMPERSAND, literal: '&', prefix: { precedence: 8, assoc: OperatorAssoc.LEFT } },
    [OperatorType.SHL]: { type: OperatorType.SHL, literal: '<<', infix: { precedence: 5, assoc: OperatorAssoc.LEFT } },
    [OperatorType.SHR]: { type: OperatorType.SHR, literal: '>>', infix: { precedence: 5, assoc: OperatorAssoc.LEFT } },
    [OperatorType.TERN]: { type: OperatorType.TERN, literal: '?', infix: { precedence: 2, assoc: OperatorAssoc.RIGHT } },

    [OperatorType.ASSIGN]: { type: OperatorType.ASSIGN, literal: '=', infix: { precedence: 1, assoc: OperatorAssoc.RIGHT } },
    [OperatorType.MINUS_ASSIGN]: { type: OperatorType.MINUS_ASSIGN, literal: '-=', infix: { precedence: 1, assoc: OperatorAssoc.RIGHT } },
    [OperatorType.ADD_ASSIGN]: { type: OperatorType.ADD_ASSIGN, literal: '+=', infix: { precedence: 1, assoc: OperatorAssoc.RIGHT } },
};

export const operatorLiteralsMap: Record<string, Operator> = Object.entries(operators).reduce((acc: Record<string, Operator>, [_, operator]) => {
    acc[operator.literal] = operator;
    return acc;
}, {});
