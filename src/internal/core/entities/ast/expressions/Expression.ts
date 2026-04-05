import DerefExpression from './expressions/prefix/DerefExpression';
import AddressExpression from './expressions/prefix/AddressExpression';
import NegateExpression from './expressions/prefix/NegateExpression';
import PrefixIncrementExpression from './expressions/prefix/PrefixIncrementExpression';
import NewExpression from './expressions/prefix/NewExpression';
import KeywordExpression from './expressions/prefix/KeywordExpression';
import IdentExpression from './expressions/prefix/IdentExpression';
import NumberExpression from './expressions/prefix/NumberExpression';
import StringLiteralExpression from './expressions/prefix/StringLiteralExpression';
import AddAssignExpression from './expressions/infix/AddAssignExpression';
import MinusAssignExpression from './expressions/infix/MinusAssignExpression';
import AssignmentExpression from './expressions/infix/AssignmentExpression';
import BinaryOperationExpression from './expressions/infix/BinaryOperationExpression';
import PostfixIncrementExpression from './expressions/postfix/PostfixIncrementExpression';
import PostfixDecrementExpression from './expressions/postfix/PostfixDecrementExpression';
import MemberExpression from './expressions/postfix/MemberExpression';
import PtrMemberExpression from './expressions/postfix/PtrMemberExpression';
import ScopeResolutionExpression from './expressions/postfix/ScopeResolutionExpression';
import TernaryExpression from './expressions/other/TernaryExpression';
import CallExpression from './expressions/other/CallExpression';
import IndexExpression from './expressions/other/IndexExpression';
import ConstructorCallExpression from './expressions/other/ConstructorCallExpression';
import PrefixDecrementExpression from './expressions/prefix/PrefixDecrementExpression';

type Expression =
    | DerefExpression
    | AddressExpression
    | NegateExpression
    | PrefixIncrementExpression
    | PrefixDecrementExpression
    | NewExpression
    | KeywordExpression
    | IdentExpression
    | NumberExpression
    | StringLiteralExpression
    | AddAssignExpression
    | MinusAssignExpression
    | AssignmentExpression
    | BinaryOperationExpression
    | PostfixIncrementExpression
    | PostfixDecrementExpression
    | MemberExpression
    | PtrMemberExpression
    | ScopeResolutionExpression
    | TernaryExpression
    | CallExpression
    | IndexExpression
    | ConstructorCallExpression;

export default Expression;
