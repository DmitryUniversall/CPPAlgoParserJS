import Token from '../../core/entities/token/Token';
import { operators } from '../../core/entities/operator/operators/operators';
import { keywords } from '../../core/entities/keyword/keywords/keywords';
import Keyword from '../../core/entities/keyword/Keyword';
import OperatorUsageInfo from '../../core/entities/operator/OperatorUsageInfo';
import TokenParser from '../../core/parser/TokenParser';

const prefixOperators: Record<string, OperatorUsageInfo> = Object.entries(operators).reduce((acc: Record<string, OperatorUsageInfo>, [_, config]) => {
    if (config.prefix) acc[config.literal] = config.prefix;
    return acc;
}, {});

const infixOperators: Record<string, OperatorUsageInfo> = Object.entries(operators).reduce((acc: Record<string, OperatorUsageInfo>, [_, config]) => {
    if (config.infix) acc[config.literal] = config.infix;
    return acc;
}, {});

const postfixOperators: Record<string, OperatorUsageInfo> = Object.entries(operators).reduce((acc: Record<string, OperatorUsageInfo>, [_, config]) => {
    if (config.postfix) acc[config.literal] = config.postfix;
    return acc;
}, {});

const keywordExpressionsMap: Record<string, Keyword> = [keywords.nullptr].reduce((acc: Record<string, Keyword>, keyword) => {
    acc[keyword.literal] = keyword;
    return acc;
}, {});

export default class PrattParser extends TokenParser {
    private isPostfix(token: Token) {
        if (!token) return false;
        return postfixOperators[token.text] !== undefined;
    }

    private isInfix(token: Token) {
        if (!token) return false;
        return infixOperators[token.text] !== undefined;
    }

    // TODO
}
