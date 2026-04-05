import BaseExpression from '../../BaseExpression';
import ExpressionType from '../../ExpressionType';
import Keyword from '../../../../keyword/Keyword';

export default interface KeywordExpression extends BaseExpression {
    type: ExpressionType.KEYWORD_EXPRESSION;
    keyword: Keyword;
}
