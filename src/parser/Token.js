export const TokenType = {
    IDENT: 'IDENT',
    NUMBER: 'NUMBER',
    STRING_LITERAL: 'STRING_LITERAL',

    IF: 'IF',
    ELSE: 'ELSE',
    FOR: 'FOR',
    WHILE: 'WHILE',
    DELETE: 'DELETE',
    NULLPTR: 'NULLPTR',

    L_PAREN: '(',
    R_PAREN: ')',
    L_BRACE: '{',
    R_BRACE: '}',
    L_BRACKET: '[',
    R_BRACKET: ']',

    SEMI: ';',
    COMMA: ',',

    OP: 'OP',
    EOF: 'EOF',
};

export class Token {
    constructor(type, text) {
        this.nodeType = "Token";
        this.type = type;
        this.text = text;
    }
}
