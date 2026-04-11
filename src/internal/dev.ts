import Lexer from './main/parser/Lexer';
import Token from './core/entities/token/Token';
import TranslationUnitParser from './main/parser/TranslationUnitParser';
import TranslationUnit from './core/entities/ast/translation_unit/TranslationUnit';

function main() {
    // noinspection CheckDtdRefs
    const input = `
        inline static int testFunc(int a, int b) const noexcept {
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
        }
        
        class TestFirst;
        
        class TestSecond : public Base, private Base2<Test2> {
            private:
                class Builder {
                    int i = 0;
                };
                
                int testFunc(int a, int b) {
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
                }
            
            public:
                virtual TestSecond(vector<int> array) noexcept : Base<T>(333), i{10}, b(123, 321) {
                    int x = 10;
                }
                
                TestSecond(vector<int> array) : i(10) {}

                TestSecond(vector<int> array);
                
                TestSecond(vector<int> array) {
                    int x = 123;
                }
                
                int i = 0;
        };
        
        class NetworkDevice {
        public:
            NetworkDevice(int s);
        
            void setSpeed(int s);
        
            int getSpeed() const;
        
        private:
            int speed;
        };
                
        string NetworkStorage::getName() const {
            return name;
        }
        
        void NetworkStorage::print() const {
            cout << name << " " << getSpeed() << " " << getCapacity() << endl;
        }
    `;

    const lexer = new Lexer(input);
    const tokens: Token[] = lexer.tokenize();

    const translationUnitParser = new TranslationUnitParser(input, tokens, 0);
    const translationUnit: TranslationUnit = translationUnitParser.parseTranslationUnit();
    console.log(translationUnit);

    // const translationUnitGenerator = new AvroraTranslationUnitGenerator(input, translationUnit);
    // const descriptions: ObjectDescription[] = translationUnitGenerator.generateDescriptionsForTranslationUnit();
    // console.log(descriptions);

    // const parser = new Parser(input, tokens, 0);
    // const statements: Statement[] = parser.parseAlgorithm();
    //
    // const generator = new AvroraGenerator(input, statements, 0);
    // const rows = generator.generateRowsForAlgorithm()
    //
    // const w = { num: 5, cond: 100, act: 150, next: 10 };
    // for (let row of rows) {
    //     console.log(
    //         `${(!!row.number ? row.number : -1).toString().padEnd(w.num)} | ` +
    //             `${(!!row.condition ? row.condition : 'null').padEnd(w.cond)} | ` +
    //             `${(!!row.action ? row.action : 'null').padEnd(w.act)} | ` +
    //             `${(!!row.next ? row.next : -1).toString().padEnd(w.next)}`,
    //     );
    //
    //     if (row.subrow) {
    //         console.log(
    //             `${' '.padEnd(w.num)} | ` +
    //                 `${(!!row.subrow.condition ? row.subrow.condition : 'null').padEnd(w.cond)} | ` +
    //                 `${(!!row.subrow.action ? row.subrow.action : 'null').padEnd(w.act)} | ` +
    //                 `${(!!row.subrow.next ? row.subrow.next : -1).toString().padEnd(w.next)}`,
    //         );
    //     }
    // }
}

main();
