import Lexer from './parser/lexer/Lexer.js';
import { Parser } from './parser/Parser.js';

function main() {
    const input = `
    int n;
    cin >> n;

    vector<NetworkStorage*> devices;

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
    }`;

    const lexer = new Lexer(input);
    const parser = new Parser(lexer.tokenize());
    const result = parser.parseProgram();
    console.log(result);
}

main();
