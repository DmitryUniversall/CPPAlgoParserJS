import ItemsProcessor from '../../../core/parser/ItemsProcessor';
import Statement from '../../../core/entities/ast/statements/Statement';
import AvroraRow from './entities/AvroraRow';
import StatementType from '../../../core/entities/ast/statements/StatementType';
import BaseStatement from '../../../core/entities/ast/statements/BaseStatement';
import BlockStatement from '../../../core/entities/ast/statements/statements/BlockStatement';
import DeclarationStatement from '../../../core/entities/ast/statements/statements/declaration/DeclarationStatement';
import PrefixTypeModifierKind from '../../../core/entities/modifier/type/prefix/modifiers/PrefixTypeModifierKind';
import IfStatement from '../../../core/entities/ast/statements/statements/IfStatement';
import ExpressionStatement from '../../../core/entities/ast/statements/statements/ExpressionStatement';
import ASTNodeType from '../../../core/entities/ast/ASTNodeType';
import Expression from '../../../core/entities/ast/expressions/Expression';
import ExpressionType from '../../../core/entities/ast/expressions/ExpressionType';
import DeleteStatement from '../../../core/entities/ast/statements/statements/DeleteStatement';
import DoWhileStatement from '../../../core/entities/ast/statements/statements/DoWhileStatement';
import WhileStatement from '../../../core/entities/ast/statements/statements/WhileStatement';
import AvroraGeneratorLoopContext from './entities/internal/AvroraGeneratorLoopContext';
import GeneratedAvroraRow from './entities/internal/GeneratedAvroraRow';
import AvroraGeneratorJumpKind from './entities/internal/AvroraGeneratorJumpKind';
import KeywordType from '../../../core/entities/keyword/KeywordType';
import { generateAvroraExpressionString, generateAvroraTypeExpressionString } from './utils/generate';
import CreateRowSchema from './entities/internal/CreateRowSchema';
import ReturnStatement from '../../../core/entities/ast/statements/statements/ReturnStatement';
import ClassicForStatement from '../../../core/entities/ast/statements/statements/for_statement/kinds/ClassicForStatement';
import RangeForStatement from '../../../core/entities/ast/statements/statements/for_statement/kinds/RangeForStatement';
import ForStatement from '../../../core/entities/ast/statements/statements/for_statement/ForStatement';
import ForStatementKind from '../../../core/entities/ast/statements/statements/for_statement/ForStatementKind';
import BaseForStatement from '../../../core/entities/ast/statements/statements/for_statement/BaseForStatement';

export default class AvroraGenerator extends ItemsProcessor<Statement> {
    private rowNumber: number;
    private readonly loopStack: AvroraGeneratorLoopContext[];

    constructor(source: string, items: Statement[], startPosition: number) {
        super(source, items, startPosition);

        this.rowNumber = 0;
        this.loopStack = [];
    }

    private getCurrentLoopContextOrThrow(): AvroraGeneratorLoopContext {
        const context: AvroraGeneratorLoopContext = this.loopStack[this.loopStack.length - 1];
        if (!context) throw new Error('Accessing loop context used outside of loop (most likely break/continue used outside of loop)');
        return context;
    }

    private createRowWith(schema: CreateRowSchema): GeneratedAvroraRow {
        return {
            number: schema.number,
            action: schema.action !== undefined ? schema.action : null,
            next: schema.next,
            condition: schema.condition !== undefined ? schema.condition : null,
            comment: schema.comment !== undefined ? schema.comment : null,
            subrow: schema.subrow !== undefined ? schema.subrow : null,
            jumpKind: schema.jumpKind !== undefined ? schema.jumpKind : null,
        };
    }

    private createNewActionRow(action: string, jumpKind?: AvroraGeneratorJumpKind): GeneratedAvroraRow {
        return this.createRowWith({
            number: ++this.rowNumber,
            action: action,
            next: this.rowNumber + 1,
            jumpKind: jumpKind,
        });
    }

    private redirectFragmentExits(rows: GeneratedAvroraRow[], target: number): void {
        // TODO: ??
        if (rows.length === 0) return;

        const internalNumbers = new Set(rows.map((row) => row.number));
        for (const row of rows) {
            if (!row.jumpKind && !internalNumbers.has(row.next) && row.next !== 0) row.next = target;

            if (row.subrow) {
                const subrow = row.subrow as GeneratedAvroraRow;
                if (!subrow.jumpKind && !internalNumbers.has(subrow.next) && subrow.next !== 0) subrow.next = target;
            }
        }
    }

    private generateBreakRow(): GeneratedAvroraRow {
        const loopContext = this.getCurrentLoopContextOrThrow();
        const row = this.createNewActionRow('выход из цикла', AvroraGeneratorJumpKind.BREAK);
        loopContext.breakRows.push(row);
        return row;
    }

    private generateContinueRow(): GeneratedAvroraRow {
        const loopContext = this.getCurrentLoopContextOrThrow();
        const row = this.createNewActionRow('переход к следующей итерации', AvroraGeneratorJumpKind.CONTINUE);
        loopContext.continueRows.push(row);
        return row;
    }

    private generateDeleteStatementRow(statement: DeleteStatement): GeneratedAvroraRow {
        return this.createNewActionRow(`удаление объекта по указателю ${generateAvroraExpressionString(statement.deleted)}`);
    }

    private generateClassicForStatementRows(statement: ClassicForStatement): GeneratedAvroraRow[] {
        const initRow: GeneratedAvroraRow[] =
            statement.init.nodeType === ASTNodeType.STATEMENT ? this.generateStatementRows(statement.init) : [this.generateExpressionRow(statement.init)];

        const condition: string = generateAvroraExpressionString(statement.condition);
        const conditionNumber: number = ++this.rowNumber;
        const conditionRow: GeneratedAvroraRow = this.createRowWith({
            number: conditionNumber,
            next: this.rowNumber + 1, // If condition is true (points to 1st in body)
            condition: condition,
        });

        const loopContext: AvroraGeneratorLoopContext = {
            breakRows: [],
            continueRows: [],
        };

        this.loopStack.push(loopContext);
        let body: GeneratedAvroraRow[] = this.generateBlockStatementRows(statement.body);
        this.loopStack.pop();

        const stepNumber = ++this.rowNumber;
        const stepRow = this.createRowWith({
            number: stepNumber,
            action: generateAvroraExpressionString(statement.step),
            next: conditionNumber, // points to condition to create cycle
        });

        if (body.length !== 0) {
            this.redirectFragmentExits(body, stepNumber);
            conditionRow.next = body[0].number;
        } else {
            conditionRow.next = stepNumber;
        }

        const afterLoopNumber: number = this.rowNumber + 1;
        for (const row of loopContext.continueRows) row.next = stepNumber;
        for (const row of loopContext.breakRows) row.next = afterLoopNumber;

        conditionRow.subrow = this.createRowWith({
            number: conditionNumber,
            next: afterLoopNumber, // If condition is false (points to 1st after the cycle)
        });

        return [...initRow, conditionRow, ...body, stepRow];
    }

    private generateRangeForStatementRows(statement: RangeForStatement): GeneratedAvroraRow[] {
        const iterableString: string = generateAvroraExpressionString(statement.iterable);

        const conditionNumber: number = ++this.rowNumber;
        const conditionRow: GeneratedAvroraRow = this.createRowWith({
            number: conditionNumber,
            next: this.rowNumber + 1, // If condition is true (points to 1st in body)
            condition: `есть следующее значение в массиве ${iterableString}`,
        });

        let itemRow: GeneratedAvroraRow;
        if (statement.item.nodeType === ASTNodeType.STATEMENT) {
            if (statement.item.declarations.length !== 1) throw Error('Range-for declaration must contain exactly one declarator');

            itemRow = this.createNewActionRow(`присвоить переменной ${statement.item.declarations[0].name} значение следующего элемента из ${iterableString}`);
        } else {
            itemRow = this.createNewActionRow(`${generateAvroraExpressionString(statement.item)} = следующее значение из ${iterableString}`);
        }

        const loopContext: AvroraGeneratorLoopContext = {
            breakRows: [],
            continueRows: [],
        };

        this.loopStack.push(loopContext);
        let body: GeneratedAvroraRow[] = this.generateBlockStatementRows(statement.body);
        this.loopStack.pop();

        if (body.length !== 0) {
            itemRow.next = body[0].number;
            this.redirectFragmentExits(body, conditionNumber);
        } else {
            itemRow.next = conditionNumber;
        }

        const afterLoopNumber: number = this.rowNumber + 1;
        for (const row of loopContext.continueRows) row.next = conditionNumber;
        for (const row of loopContext.breakRows) row.next = afterLoopNumber;

        conditionRow.subrow = this.createRowWith({
            number: conditionNumber,
            next: afterLoopNumber, // If condition is false (points to 1st after the cycle)
        });

        return [conditionRow, itemRow, ...body];
    }

    private generateForStatementRows(statement: ForStatement): GeneratedAvroraRow[] {
        switch (statement.kind) {
            case ForStatementKind.CLASSIC:
                return this.generateClassicForStatementRows(statement);
            case ForStatementKind.RANGE:
                return this.generateRangeForStatementRows(statement);
            default:
                throw Error(`Unsupported ForStatement kind: ${(statement as BaseForStatement).kind}`);
        }
    }

    private generateDoWhileStatementRows(statement: DoWhileStatement): GeneratedAvroraRow[] {
        const loopContext: AvroraGeneratorLoopContext = {
            breakRows: [],
            continueRows: [],
        };

        this.loopStack.push(loopContext);
        let body: GeneratedAvroraRow[] = this.generateBlockStatementRows(statement.body);
        this.loopStack.pop();

        const conditionNumber: number = ++this.rowNumber;
        const conditionRow: GeneratedAvroraRow = this.createRowWith({
            number: conditionNumber,
            next: body.length !== 0 ? body[0].number : conditionNumber, // If condition is true
            condition: generateAvroraExpressionString(statement.condition),
            subrow: this.createRowWith({
                number: conditionNumber,
                next: this.rowNumber + 1, // If condition is false (points to 1st after the cycle)
            }),
        });

        if (body.length !== 0) this.redirectFragmentExits(body, conditionNumber);

        const afterLoopNumber: number = this.rowNumber + 1;
        for (const row of loopContext.continueRows) row.next = conditionNumber;
        for (const row of loopContext.breakRows) row.next = afterLoopNumber;

        return [...body, conditionRow];
    }

    private generateWhileStatementRows(statement: WhileStatement): GeneratedAvroraRow[] {
        const condition: string = generateAvroraExpressionString(statement.condition);
        const conditionNumber: number = ++this.rowNumber;
        const conditionRow: GeneratedAvroraRow = this.createRowWith({
            number: conditionNumber,
            next: -1, // If condition is true (will be reassigned later)
            condition: condition,
        });

        const loopContext: AvroraGeneratorLoopContext = {
            breakRows: [],
            continueRows: [],
        };

        this.loopStack.push(loopContext);
        let body: GeneratedAvroraRow[] = this.generateBlockStatementRows(statement.body);
        this.loopStack.pop();

        if (body.length !== 0) {
            this.redirectFragmentExits(body, conditionNumber);
            conditionRow.next = body[0].number;
        } else {
            conditionRow.next = conditionNumber;
        }

        const afterLoopNumber = this.rowNumber + 1;
        for (const row of loopContext.continueRows) row.next = conditionNumber;
        for (const row of loopContext.breakRows) row.next = afterLoopNumber;

        conditionRow.subrow = this.createRowWith({
            number: conditionNumber,
            next: this.rowNumber + 1, // If condition is false (points to 1st after the cycle)
        });

        return [conditionRow, ...body];
    }

    private generateIfStatementRows(statement: IfStatement): GeneratedAvroraRow[] {
        const conditionNumber: number = ++this.rowNumber;
        const conditionRow: GeneratedAvroraRow = this.createRowWith({
            number: conditionNumber,
            next: -1, // If condition is true (will be reassigned later)
            condition: generateAvroraExpressionString(statement.condition),
        });

        const thenBody: GeneratedAvroraRow[] = this.generateBlockStatementRows(statement.thenStmt);
        const elseBody: GeneratedAvroraRow[] = statement.elseStmt ? this.generateBlockStatementRows(statement.elseStmt) : [];

        const afterIfNumber: number = this.rowNumber + 1;
        conditionRow.next = thenBody.length > 0 ? thenBody[0].number : afterIfNumber;
        conditionRow.subrow = this.createRowWith({
            number: conditionNumber,
            next: elseBody.length > 0 ? elseBody[0].number : afterIfNumber, // If condition is false
        });

        this.redirectFragmentExits(thenBody, afterIfNumber);
        this.redirectFragmentExits(elseBody, afterIfNumber);

        return [conditionRow, ...thenBody, ...elseBody];
    }

    private generateDeclarationStatementRows(statement: DeclarationStatement): GeneratedAvroraRow[] {
        const type: string = generateAvroraTypeExpressionString(statement.varType);
        const varType: string = statement.varType.prefixModifiers.some((modifier) => modifier.kind === PrefixTypeModifierKind.CONST)
            ? 'константы'
            : 'переменной';

        return statement.declarations.map((declaration) => {
            const arrayString = !!declaration.arrayLength ? `массив длиной ${generateAvroraExpressionString(declaration.arrayLength)}` : '';

            if (declaration.init)
                return this.createNewActionRow(
                    `инициализация ${varType} ${declaration.name}${arrayString.length !== 0 ? ` (${arrayString})` : ''} типа ${type} значением ${generateAvroraExpressionString(declaration.init)}`,
                );

            return this.createNewActionRow(`объявление ${varType} ${declaration.name}${arrayString.length !== 0 ? ` (${arrayString})` : ''} типа ${type}`);
        });
    }

    private generateBlockStatementRows(statement: BlockStatement): GeneratedAvroraRow[] {
        return statement.body.flatMap((bodyStatement) => this.generateStatementRows(bodyStatement));
    }

    private generateReturnStatementRow(statement: ReturnStatement): GeneratedAvroraRow {
        return this.createRowWith({
            number: ++this.rowNumber,
            action: statement.returned !== null ? `Возврат: ${generateAvroraExpressionString(statement.returned)}` : "Выход из функции",
            next: 0,
        });
    }

    private generateStatementRows(statement: Statement): GeneratedAvroraRow[] {
        switch (statement.type) {
            case StatementType.DELETE_STATEMENT:
                return [this.generateDeleteStatementRow(statement)];
            case StatementType.EXPRESSION_STATEMENT:
                return [this.generateExpressionStatementRow(statement)];
            case StatementType.RETURN_STATEMENT:
                return [this.generateReturnStatementRow(statement)];
            case StatementType.DECLARATION_STATEMENT:
                return this.generateDeclarationStatementRows(statement);
            case StatementType.BLOCK_STATEMENT:
                return this.generateBlockStatementRows(statement);
            case StatementType.IF_STATEMENT:
                return this.generateIfStatementRows(statement);
            case StatementType.WHILE_STATEMENT:
                return this.generateWhileStatementRows(statement);
            case StatementType.FOR_STATEMENT:
                return this.generateForStatementRows(statement as ForStatement); // FIXME: Argument of type BaseForStatement is not assignable to parameter of type ForStatement
            case StatementType.DO_WHILE_STATEMENT:
                return this.generateDoWhileStatementRows(statement);
            default:
                throw new Error(`Unexpected statement: '${(statement as BaseStatement).type}'`);
        }
    }

    private generateExpressionRow(expression: Expression): GeneratedAvroraRow {
        if (expression.type === ExpressionType.KEYWORD_EXPRESSION) {
            if (expression.keyword.type === KeywordType.BREAK) return this.generateBreakRow();
            if (expression.keyword.type === KeywordType.CONTINUE) return this.generateContinueRow();
        }

        return this.createNewActionRow(generateAvroraExpressionString(expression));
    }

    public generateExpressionStatementRow(statement: ExpressionStatement): GeneratedAvroraRow {
        return this.generateExpressionRow(statement.expr);
    }

    public generateRowsForAlgorithm(): AvroraRow[] {
        const rows: GeneratedAvroraRow[] = [];

        while (this.peek() != null) {
            const r = this.generateStatementRows(this.nextOrThrow());
            r.forEach((it) => rows.push(it));
        }

        return rows;
    }
}
