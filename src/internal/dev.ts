import Lexer from './main/parser/Lexer';
import Token from './core/entities/token/Token';
import TranslationUnitParser from './main/parser/TranslationUnitParser';
import TranslationUnit from './core/entities/ast/translation_unit/TranslationUnit';
import Description from './main/generator/avrora/entities/description/Description';
import AvroraTranslationUnitGenerator from './main/generator/avrora/AvroraTranslationUnitGenerator';

function main() {
    // noinspection CheckDtdRefs
    const input = `
class cl_base
{
protected:
    string s_object_name;
    cl_base* p_head_object;
    vector<cl_base*> subordinate_objects;

public:
    cl_base(cl_base* p_head_object, string s_object_name = "Base_object")
    {
        this->p_head_object = p_head_object;
        this->s_object_name = s_object_name;

        if (p_head_object != nullptr)
        {
            p_head_object->subordinate_objects.push_back(this);
        }
    }

    virtual ~cl_base()
    {
        for (cl_base* object : subordinate_objects)
        {
            delete object;
        }
    }

    bool set_object_name(string new_name)
    {
        if (p_head_object == nullptr)
        {
            s_object_name = new_name;
            return true;
        }

        for (cl_base* object : p_head_object->subordinate_objects)
        {
            if (object != this && object->s_object_name == new_name)
            {
                return false;
            }
        }

        s_object_name = new_name;
        return true;
    }

    string get_object_name()
    {
        return s_object_name;
    }

    cl_base* get_head_object()
    {
        return p_head_object;
    }

    int get_subordinate_object_count()
    {
        return static_cast<int>(subordinate_objects.size());
    }

    void print_tree()
    {
        queue<cl_base*> objects;
        objects.push(this);

        while (!objects.empty())
        {
            cl_base* current_object = objects.front();
            objects.pop();

            cout << current_object->s_object_name << endl;

            for (cl_base* object : current_object->subordinate_objects)
            {
                objects.push(object);
            }
        }
    }

    cl_base* get_subordinate_object(string object_name)
    {
        for (cl_base* object : subordinate_objects)
        {
            if (object->s_object_name == object_name)
            {
                return object;
            }
        }
        return nullptr;
    }

    cl_base* get_subordinate_object(int index)
    {
        if (index < 1 || index > static_cast<int>(subordinate_objects.size()))
        {
            return nullptr;
        }
        return subordinate_objects[index - 1];
    }
};
    `;

    const lexer = new Lexer(input);
    const tokens: Token[] = lexer.tokenize();

    const translationUnitParser = new TranslationUnitParser(input, tokens, 0);
    const translationUnit: TranslationUnit = translationUnitParser.parseTranslationUnit();
    // console.log(translationUnit);

    const translationUnitGenerator = new AvroraTranslationUnitGenerator(input, translationUnit);
    const descriptions: Description[] = translationUnitGenerator.generateDescriptionsForTranslationUnit();
    console.log(JSON.stringify(translationUnit));
    console.log(JSON.stringify(descriptions));

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
