enum TokenType {
    IDENT = 'IDENT',
    NUMBER = 'NUMBER',
    STRING_LITERAL = 'STRING_LITERAL',

    KEYWORD = 'KEYWORD',
    OPERATOR = 'OPERATOR',
    EOF = 'EOF',

    L_PAREN = '(',
    R_PAREN = ')',
    L_BRACE = '{',
    R_BRACE = '}',
    L_BRACKET = '[',
    R_BRACKET = ']',
    COLON = ':',
    SEMI = ';',
    COMMA = ',',
}

export default TokenType;
