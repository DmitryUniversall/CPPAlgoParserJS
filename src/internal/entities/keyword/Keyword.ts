import KeywordType from './KeywordType';
import KeywordKind from './KeywordKind';

export default interface Keyword {
    type: KeywordType;
    kind: KeywordKind;
    literal: string;
}
