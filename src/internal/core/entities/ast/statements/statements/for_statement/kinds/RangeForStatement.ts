import BaseForStatement from '../BaseForStatement';
import DeclarationStatement from '../../declaration/DeclarationStatement';
import Expression from '../../../../expressions/Expression';
import ForStatementKind from '../ForStatementKind';

export default interface RangeForStatement extends BaseForStatement {
    kind: ForStatementKind.RANGE;
    item: Expression | DeclarationStatement;
    iterable: Expression;
}
