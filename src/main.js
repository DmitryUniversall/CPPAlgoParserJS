import Lexer from './parser/Lexer.js';
import { Parser } from './parser/Parser.js';

function main() {
    const input = `printf(123);
    for (int i = 0; i < current - 1; i++) {
        test.printf(444);
    }
    printf(321);`;

    const lexer = new Lexer(input);
    const parser = new Parser(lexer.tokenize());
    console.log(parser.parseProgram());
}

main()
