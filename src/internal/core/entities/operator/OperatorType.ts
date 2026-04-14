enum OperatorType {
    PLUS = 'plus',
    MINUS = 'minus',
    STAR = 'star',
    SLASH = 'slash',
    INC = 'inc',
    DEC = 'dec',
    NOT = 'not',
    BITWISE_NOT = 'bitwiseNot',

    EQ = 'eq',
    NEQ = 'neq',
    LT = 'lt',
    GT = 'gt',
    LTE = 'lte',
    GTE = 'gte',

    AND = 'and',
    OR = 'or',
    AMPERSAND = 'ampersand',

    ASSIGN = 'assign',
    MINUS_ASSIGN = 'minusAssign',
    ADD_ASSIGN = 'addAssign',

    ARROW = 'arrow',
    DOT = 'dot',
    NAMESPACE_ACCESS = 'namespaceAccess',

    SHL = 'shl',
    SHR = 'shr',

    TERN = 'tern',
}

export default OperatorType;
