import Lexer from './main/parser/Lexer';
import Token from './core/entities/token/Token';
import Parser from './main/parser/Parser';
import Statement from './core/entities/ast/statements/Statement';
import AvroraGenerator from './main/generator/avrora/AvroraGenerator';
import TranslationUnitParser from './main/parser/TranslationUnitParser';
import TranslationUnit from './core/entities/ast/translation_unit/TranslationUnit';

function main() {
    // noinspection CheckDtdRefs
    const input = `
            while (i < 10) {
                cout << "Test" << endl;
                cout << 'Test' << endl;
                
                if (test > 0) {
                    cout << "Test2" << endl;
                    break;
                }
                
                continue;
            }
            
            cout << "Initial state" << endl;
            int n;
            cin >> n;
            
            n += 1;
            n -= 1;
            object.n += 1;
            object.n -= 1;
    `;

    const lexer = new Lexer(input);
    const tokens: Token[] = lexer.tokenize();

    // const translationUnitParser = new TranslationUnitParser(input, tokens, 0);
    // const translationUnit: TranslationUnit = translationUnitParser.parseTranslationUnit();
    // console.log(translationUnit);

    const parser = new Parser(input, tokens, 0);
    const statements: Statement[] = parser.parseAlgorithm();

    const generator = new AvroraGenerator(input, statements, 0);
    const rows = generator.generateRowsForAlgorithm()

    const w = { num: 5, cond: 100, act: 150, next: 10 };
    for (let row of rows) {
        console.log(
            `${(!!row.number ? row.number : -1).toString().padEnd(w.num)} | ` +
                `${(!!row.condition ? row.condition : 'null').padEnd(w.cond)} | ` +
                `${(!!row.action ? row.action : 'null').padEnd(w.act)} | ` +
                `${(!!row.next ? row.next : -1).toString().padEnd(w.next)}`,
        );

        if (row.subrow) {
            console.log(
                `${' '.padEnd(w.num)} | ` +
                    `${(!!row.subrow.condition ? row.subrow.condition : 'null').padEnd(w.cond)} | ` +
                    `${(!!row.subrow.action ? row.subrow.action : 'null').padEnd(w.act)} | ` +
                    `${(!!row.subrow.next ? row.subrow.next : -1).toString().padEnd(w.next)}`,
            );
        }
    }
}

main();
