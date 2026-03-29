export const TokenType = {
    IDENT: 'IDENT',
    NUMBER: 'NUMBER',
    STRING_LITERAL: 'STRING_LITERAL',

    IF: 'IF',
    ELSE: 'ELSE',
    FOR: 'FOR',
    WHILE: 'WHILE',

    L_PAREN: '(',
    R_PAREN: ')',
    L_BRACE: '{',
    R_BRACE: '}',
    L_BRACKET: '[',
    R_BRACKET: ']',

    SEMI: ';',
    COMMA: ',',

    DOT: '.',
    ARROW: '->',

    OP: 'OP',
    EOF: 'EOF',
};

export class Token {
    constructor(type, text) {
        this.objectType = "Token";
        this.type = type;
        this.text = text;
    }
}
