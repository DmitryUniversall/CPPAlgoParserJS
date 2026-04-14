import DeclarationStatement from './statements/declaration/DeclarationStatement';
import BlockStatement from './statements/BlockStatement';
import DeleteStatement from './statements/DeleteStatement';
import IfStatement from './statements/IfStatement';
import WhileStatement from './statements/WhileStatement';
import BaseForStatement from './statements/for_statement/BaseForStatement';
import ExpressionStatement from './statements/ExpressionStatement';
import DoWhileStatement from './statements/DoWhileStatement';
import ReturnStatement from './statements/ReturnStatement';

type Statement =
    | DeclarationStatement
    | BlockStatement
    | DeleteStatement
    | IfStatement
    | WhileStatement
    | DoWhileStatement
    | BaseForStatement
    | ExpressionStatement
    | ReturnStatement;

export default Statement;
