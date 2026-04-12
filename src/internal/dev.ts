import Lexer from './main/parser/Lexer';
import Token from './core/entities/token/Token';
import TranslationUnitParser from './main/parser/TranslationUnitParser';
import TranslationUnit from './core/entities/ast/translation_unit/TranslationUnit';
import Description from './main/generator/avrora/entities/description/Description';
import AvroraTranslationUnitGenerator from './main/generator/avrora/AvroraTranslationUnitGenerator';

function main() {
    // noinspection CheckDtdRefs
    const input = `

class Sensor {
private:
    int valuePrivate;

    void setValuePrivate(int number) {
        valuePrivate = number * 3;
    }

public:
    int valuePublic;

    Sensor(int privateValue, int publicValue) {
        setValuePrivate(privateValue);
        valuePublic = publicValue;
    }

    void setValues(int privateValue, int publicValue) {
        setValuePrivate(privateValue);
        valuePublic = publicValue;
    }

    void print() const {
        std::cout << "Sensor: " << valuePrivate << ' ' << valuePublic << '\\n';
    }
};

class Test : public BaseTest {
private:
    int valuePrivate;

public:
    int valuePublic;

    Test(int privateValue, int publicValue)
        : BaseTest(privateValue, publicValue),
          valuePrivate(privateValue),
          valuePublic(publicValue) {
          int x = 0;
    }

    void setValues(int privateValue, int publicValue) {
        valuePrivate = privateValue;
        valuePublic = publicValue;
    }

    void print() const {
        std::cout << "Test: " << valuePrivate << ' ' << valuePublic << '\\n';
    }
};

int main() {
    int firstValue;
    int secondValue;
    std::cin >> firstValue >> secondValue;

    SmartSensor smartSensor(firstValue, secondValue);

    smartSensor.Sensor::print();
    smartSensor.SmartSensor::print();

    int number;
    std::cin >> number;

    smartSensor.SmartSensor::valuePublic = number;
    smartSensor.Sensor::valuePublic = number;

    smartSensor.SmartSensor::print();
    smartSensor.Sensor::print();

    int a;
    int b;
    std::cin >> a >> b;

    if (a > 0) {
        smartSensor.SmartSensor::setValues(a + 1, b + 1);
        smartSensor.Sensor::setValues(a - 1, b - 1);

        smartSensor.SmartSensor::print();
        smartSensor.Sensor::print();
    } else {
        smartSensor.Sensor::setValues(a + 1, b + 1);
        smartSensor.SmartSensor::setValues(a - 1, b - 1);

        smartSensor.Sensor::print();
        smartSensor.SmartSensor::print();
    }
}
    class Test;

    `;

    const lexer = new Lexer(input);
    const tokens: Token[] = lexer.tokenize();

    const translationUnitParser = new TranslationUnitParser(input, tokens, 0);
    const translationUnit: TranslationUnit = translationUnitParser.parseTranslationUnit();
    console.log(translationUnit);

    const translationUnitGenerator = new AvroraTranslationUnitGenerator(input, translationUnit);
    const descriptions: Description[] = translationUnitGenerator.generateDescriptionsForTranslationUnit();
    console.log(descriptions);

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
