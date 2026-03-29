import Lexer from './parser/Lexer.js';
import { Parser } from './parser/Parser.js';

function main() {
    const input = `
    for (size_t i = 0; i < devices_size; i++) {
        const NetworkStorage* device = devices[i];

        if (device != nullptr && device->getSpeed() < minSpeed) {
            const string name = device->getName();
            const int capacity = device->getCapacity();

            delete device;
        }
    }`;

    const lexer = new Lexer(input);
    const parser = new Parser(lexer.tokenize());
    console.log(parser.parseProgram());
}

main()
