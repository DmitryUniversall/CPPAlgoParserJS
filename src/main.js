import Lexer from './parser/lexer/Lexer.js';
import { Parser } from './parser/Parser.js';
import Generator from './generator/Generator.js';

function main() {
    const input = `
    int n;
    cin >> n;

    const vector<const NetworkStorage*> devices;

    for (int i = 0; i < n; i++)
    {
        string name;
        int speed, capacity;
        cin >> name >> speed >> capacity;

        devices.push_back(new NetworkStorage(name, speed, capacity));
    }

    devices.push_back(nullptr);

    cout << "Initial state" << endl;

    const size_t devices_size = devices.size();

    for (size_t i = 0; i < devices_size; i++)
    {
        const NetworkStorage* device = devices[i];

        if (device != nullptr)
        {
            device->print();
        }
        else
        {
            cout << "Empty pointer" << endl;
        }
    }

    int minSpeed;
    cin >> minSpeed;

    for (size_t i = 0; i < devices_size; i++)
    {
        const NetworkStorage* device = devices[i];

        if (device != nullptr && device->getSpeed() < minSpeed)
        {
            const string name = device->getName();
            const int capacity = device->getCapacity();

            delete device;

            device = new NetworkStorage(name, 2 * minSpeed, capacity);
        }
    }

    cout << "Modified state" << endl;

    for (size_t i = 0; i < devices_size; i++)
    {
        const NetworkStorage* device = devices[i];

        if (device != nullptr)
        {
            device->print();
        }
        else
        {
            cout << "Empty pointer" << endl;
        }

        delete device;
    }
    cout << device.test << endl;
    cout << device->test << endl;
    cout << device.getTest() << endl;
`;

    const lexer = new Lexer(input);
    const parser = new Parser(lexer.tokenize());
    const result = parser.parseProgram();
    // console.log(result);

    const generator = new Generator(result);
    const generated = generator.generate();
    // console.log(generated);

    const w = { num: 5, cond: 100, act: 150, next: 10 };
    for (let row of generated) {
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
