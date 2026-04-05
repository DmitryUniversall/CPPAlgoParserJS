import BaseStatement from '../BaseStatement';
import StatementType from '../StatementType';
import Expression from '../../expressions/Expression';
import BlockStatement from './BlockStatement';
import DeclarationStatement from './declaration/DeclarationStatement';

export default interface ForStatement extends BaseStatement {  // TODO: Support for (;;)
    type: StatementType.FOR_STATEMENT;
    init: DeclarationStatement | Expression;
    condition: Expression;
    step: Expression;
    body: BlockStatement;
}
