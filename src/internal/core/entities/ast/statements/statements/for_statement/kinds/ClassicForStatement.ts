import DeclarationStatement from '../../declaration/DeclarationStatement';
import Expression from '../../../../expressions/Expression';
import BaseForStatement from '../BaseForStatement';
import ForStatementKind from '../ForStatementKind';

// TODO: Support for (;;)
export default interface ClassicForStatement extends BaseForStatement {
    kind: ForStatementKind.CLASSIC;
    init: DeclarationStatement | Expression;
    condition: Expression;
    step: Expression;
}
