import BaseStatement from '../../BaseStatement';
import StatementType from '../../StatementType';
import TypeExpression from '../../../type/TypeExpression';
import DeclarationInfo from './DeclarationInfo';

export default interface DeclarationStatement extends BaseStatement {
    type: StatementType.DECLARATION_STATEMENT;
    varType: TypeExpression;
    declarations: DeclarationInfo[];
}
