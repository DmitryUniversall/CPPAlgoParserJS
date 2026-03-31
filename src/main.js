import Lexer from './parser/lexer/Lexer.js';
import Parser from './parser/Parser.js';
import Generator from './generator/Generator.js';

function main() {
    // noinspection CheckDtdRefs
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
    
    const MyVector<int>* ptr = new MyVector<int>(10, 0);

    int a = 1, b = 2, c;
    c = a + b * 3;
    
    int arr[10];
    arr[0] = c;
    
    if (c > 10 && a != b) {
        ptr->push_back(c);
    } else {
        ptr->push_back(a + b);
    }
    
    for (int i = 0; i < 5; i++) {
        arr[i] = i << 1;
    }
    
    while (a < 100) {
        a = a + (b > 5 ? b : 1);
        ++a;
    }
    
    int* x = &a;
    int y = *x;
    
    y = (a > b) ? a : b;
    
    MyObject obj;
    obj.value = y;
    obj.increment();
    
    MyObject* objPtr = new MyObject();
    objPtr->value = obj.value;
    objPtr->increment();
    
    int result = objPtr->getValue() + obj.getValue();
    
    int z = (a = b = 5);
    
    string message = "Hello world";
    
    delete ptr;
    delete objPtr;

    object.x = new NetworkStorage(name, speed, capacity);
`; //int arr[5]; int* x = &a;

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
