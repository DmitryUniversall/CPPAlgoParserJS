import BaseStatement from '../BaseStatement';
import StatementType from '../StatementType';
import Expression from '../../expressions/Expression';
import BlockStatement from './BlockStatement';
import DeclarationStatement from './declaration/DeclarationStatement';

export default interface ForStatement extends BaseStatement {
    type: StatementType.FOR_STATEMENT;
    init: DeclarationStatement | Expression | null;
    condition: Expression | null;
    step: Expression | null;
    body: BlockStatement | null;
}
