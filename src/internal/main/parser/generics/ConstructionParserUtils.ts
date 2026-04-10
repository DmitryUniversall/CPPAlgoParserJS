import Statement from '../../../core/entities/ast/statements/Statement';
import StatementParser from '../StatementParser';
import StatementParserUtils from './StatementParserUtils';

export default class ConstructionParserUtils extends StatementParserUtils {
    protected parseStatement(): Statement {
        const parser = new StatementParser(this.source, this.tokens, this.position);
        const result: Statement = parser.parseStatement();
        this.position = parser.currentPosition;
        return result;
    }
}
