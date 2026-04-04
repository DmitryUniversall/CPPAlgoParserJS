import TokenType from './TokenType';

export default interface Token {
    tokenType: TokenType;
    text: string;

    globalPosition: number;
    line: number;
    inlinePosition: number;
}
