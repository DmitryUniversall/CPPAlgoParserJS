import ItemsProcessor from '../../../core/parser/CoreParser';
import Statement from '../../../core/entities/ast/statements/Statement';
import AvroraRow from './entities/AvroraRow';
import StatementType from '../../../core/entities/ast/statements/StatementType';
import BaseStatement from '../../../core/entities/ast/statements/BaseStatement';
import BlockStatement from '../../../core/entities/ast/statements/statements/BlockStatement';
import DeclarationStatement from '../../../core/entities/ast/statements/statements/declaration/DeclarationStatement';
import PrefixTypeModifierKind from '../../../core/entities/modifier/type/prefix/modifiers/PrefixTypeModifierKind';
import IfStatement from '../../../core/entities/ast/statements/statements/IfStatement';
import ForStatement from '../../../core/entities/ast/statements/statements/ForStatement';
import ExpressionStatement from '../../../core/entities/ast/statements/statements/ExpressionStatement';
import ASTNodeType from '../../../core/entities/ast/ASTNodeType';
import Expression from '../../../core/entities/ast/expressions/Expression';
import { operators } from '../../../core/entities/operator/operators/operators';
import ExpressionType from '../../../core/entities/ast/expressions/ExpressionType';
import TypeExpression from '../../../core/entities/ast/type/TypeExpression';
import DeleteStatement from '../../../core/entities/ast/statements/statements/DeleteStatement';
import DoWhileStatement from '../../../core/entities/ast/statements/statements/DoWhileStatement';
import WhileStatement from '../../../core/entities/ast/statements/statements/WhileStatement';
import CallExpression from '../../../core/entities/ast/expressions/expressions/other/CallExpression';
import BinaryOperationExpression from '../../../core/entities/ast/expressions/expressions/infix/BinaryOperationExpression';

type CreateRowSchema = {
    number: number;
    action?: string | null;
    next: number;
    condition?: string | null;
    comment?: string | null;
    subrow?: AvroraRow | null;
};

export default class AvroraGenerator extends ItemsProcessor<Statement> {
    private rowNumber: number;

    constructor(source: string, items: Statement[], startPosition: number) {
        super(source, items, startPosition);

        this.rowNumber = 0;
    }

    private createRowWith(schema: CreateRowSchema): AvroraRow {
        return {
            number: schema.number,
            action: schema.action !== undefined ? schema.action : null,
            next: schema.next,
            condition: schema.condition !== undefined ? schema.condition : null,
            comment: schema.comment !== undefined ? schema.comment : null,
            subrow: schema.subrow !== undefined ? schema.subrow : null,
        };
    }

    private createNewActionRow(action: string): AvroraRow {
        return {
            number: ++this.rowNumber,
            action,
            next: this.rowNumber + 1,
            condition: null,
            comment: null,
            subrow: null,
        };
    }

    private redirectFragmentExits(rows: AvroraRow[], target: number): void {
        // TODO: ??
        if (rows.length === 0) return;

        const internalNumbers = new Set(rows.map((row) => row.number));

        for (const row of rows) {
            if (!internalNumbers.has(row.next)) row.next = target;
            if (row.subrow && !internalNumbers.has(row.subrow.next)) row.subrow.next = target;
        }
    }

    private getInputVarNamesFromExpression(expression: Expression, found: string[]): string[] {
        if (expression.type !== ExpressionType.BINARY_OPERATION_EXPRESSION || expression.operator !== operators.shr) return found;

        found = [this.generateExpressionString(expression.right), ...found];

        if (!expression.left) return found;
        return this.getInputVarNamesFromExpression(expression.left, found);
    }

    private isInputExpression(expression: Expression): boolean {
        if (expression.type === ExpressionType.IDENT_EXPRESSION && expression.identifier === 'cin') return true;
        if (expression.type === ExpressionType.SCOPE_RESOLUTION_EXPRESSION && expression.field === 'cin') return true;

        if (expression.type !== ExpressionType.BINARY_OPERATION_EXPRESSION) return false;
        if (expression.operator !== operators.shr) return false;

        const left: Expression = expression.left;
        if (
            left.type !== ExpressionType.BINARY_OPERATION_EXPRESSION &&
            left.type !== ExpressionType.IDENT_EXPRESSION &&
            left.type !== ExpressionType.SCOPE_RESOLUTION_EXPRESSION
        )
            return false;

        return this.isInputExpression(expression.left);
    }

    private getOutputStringsFromExpression(expression: Expression, found: string[]): string[] {
        if (expression.type !== ExpressionType.BINARY_OPERATION_EXPRESSION || expression.operator !== operators.shl) return found;

        found = [this.generateExpressionString(expression.right), ...found];

        if (!expression.left) return found;
        return this.getOutputStringsFromExpression(expression.left, found);
    }

    private isOutputExpression(expression: Expression): boolean {
        if (expression.type === ExpressionType.IDENT_EXPRESSION && expression.identifier === 'cout') return true;
        if (expression.type === ExpressionType.SCOPE_RESOLUTION_EXPRESSION && expression.field === 'cout') return true;

        if (expression.type !== ExpressionType.BINARY_OPERATION_EXPRESSION) return false;
        if (expression.operator !== operators.shl) return false;

        const left: Expression = expression.left;
        if (
            left.type !== ExpressionType.BINARY_OPERATION_EXPRESSION &&
            left.type !== ExpressionType.IDENT_EXPRESSION &&
            left.type !== ExpressionType.SCOPE_RESOLUTION_EXPRESSION
        )
            return false;

        return this.isOutputExpression(expression.left);
    }

    private generateTypeExpressionString(typeExpression: TypeExpression): string {
        return `${typeExpression.prefixModifiers.length !== 0 ? typeExpression.prefixModifiers.flatMap((it) => it.literal).join(' ') + ' ' : ''}${typeExpression.typeName}${typeExpression.typeParameters.length !== 0 ? `<${typeExpression.typeParameters.map((it) => this.generateTypeExpressionString(it))}>` : ''}${typeExpression.postfixModifiers.flatMap((it) => it.literal).join('')}`;
    }

    private generateCallArgs(args: Expression[]): string {
        if (args.length === 0) return '';
        return args.map((it) => this.generateExpressionString(it)).join(', ');
    }

    private generateCallExpressionString(expression: CallExpression): string {
        let args: string = this.generateCallArgs(expression.args);

        if (expression.called.type === ExpressionType.NEW_EXPRESSION)
            return `выделение памяти под объект типа ${this.generateTypeExpressionString(expression.called.typeExpr)}, получение указателя и вызов конструктора${args ? ' с параметрами: ' + args : ''}`;

        if (expression.called.type === ExpressionType.MEMBER_EXPRESSION || expression.called.type === ExpressionType.PTR_MEMBER_EXPRESSION) {
            return `вызов метода ${expression.called.field} у объекта ${this.generateExpressionString(expression.called.owner)}${args ? ' с параметрами: ' + args : ''}`;
        }

        return `вызов функции ${this.generateExpressionString(expression.called)}${args ? ' с параметрами: ' + args : ''}`;
    }

    private generateBinaryOperationExpressionString(expression: BinaryOperationExpression): string {
        if (this.isInputExpression(expression)) return 'Ввод: ' + this.getInputVarNamesFromExpression(expression, []).join(', ');
        if (this.isOutputExpression(expression)) return 'Вывод: ' + this.getOutputStringsFromExpression(expression, []).join(' + ');
        return this.generateExpressionString(expression.left) + ' ' + expression.operator.literal + ' ' + this.generateExpressionString(expression.right);
    }

    private generateExpressionString(expression: Expression): string {
        switch (expression.type) {
            case ExpressionType.IDENT_EXPRESSION:
                return expression.identifier;
            case ExpressionType.NUMBER_EXPRESSION:
                return expression.number;
            case ExpressionType.KEYWORD_EXPRESSION:
                return expression.keyword.literal;
            case ExpressionType.STRING_LITERAL_EXPRESSION:
                return `"${expression.literal}"`;
            case ExpressionType.NEGATE_EXPRESSION:
                return `-${this.generateExpressionString(expression.expr)}`;
            case ExpressionType.BINARY_OPERATION_EXPRESSION:
                return this.generateBinaryOperationExpressionString(expression);
            case ExpressionType.TERNARY_EXPRESSION:
                return `условие если ${this.generateExpressionString(expression.condition)} то ${this.generateExpressionString(expression.thenExpr)} иначе ${this.generateExpressionString(expression.elseExpr)}`;
            case ExpressionType.PREFIX_INCREMENT_EXPRESSION:
                return 'увеличение ' + this.generateExpressionString(expression.expr);
            case ExpressionType.POSTFIX_INCREMENT_EXPRESSION:
                return 'увеличение ' + this.generateExpressionString(expression.expr);
            case ExpressionType.PREFIX_DECREMENT_EXPRESSION:
                return 'уменьшение ' + this.generateExpressionString(expression.expr);
            case ExpressionType.POSTFIX_DECREMENT_EXPRESSION:
                return 'уменьшение ' + this.generateExpressionString(expression.expr);
            case ExpressionType.DEREF_EXPRESSION:
                return 'разыменование указателя ' + this.generateExpressionString(expression.expr);
            case ExpressionType.ADDRESS_EXPRESSION:
                return 'взятие адреса объекта ' + this.generateExpressionString(expression.expr);
            case ExpressionType.CALL_EXPRESSION:
                return this.generateCallExpressionString(expression);
            case ExpressionType.CONSTRUCTOR_CALL_EXPRESSION:
                let args = expression.args.map((it) => this.generateExpressionString(it)).join(', ');
                return `вызов конструктора${args ? ' с параметрами: ' + args : ''}`;
            case ExpressionType.MEMBER_EXPRESSION:
                return `${this.generateExpressionString(expression.owner)}.${expression.field}`;
            case ExpressionType.PTR_MEMBER_EXPRESSION:
                return `${this.generateExpressionString(expression.owner)}->${expression.field}`;
            case ExpressionType.SCOPE_RESOLUTION_EXPRESSION:
                return `${this.generateExpressionString(expression.scope)}::${expression.field}`;
            case ExpressionType.INDEX_EXPRESSION:
                return 'элемент объекта ' + this.generateExpressionString(expression.owner) + ' по индексу ' + this.generateExpressionString(expression.index);
            case ExpressionType.NEW_EXPRESSION:
                return `выделение памяти под объект типа ${this.generateTypeExpressionString(expression.typeExpr)} и получение указателя`;
            case ExpressionType.ADD_ASSIGN_EXPRESSION:
                if (expression.left.type === ExpressionType.MEMBER_EXPRESSION)
                    return `увеличение поля ${expression.left.field} объекта ${this.generateExpressionString(expression.left.owner)} на ${this.generateExpressionString(expression.right)}`;
                return `увеличение переменной ${this.generateExpressionString(expression.left)} на ${this.generateExpressionString(expression.right)}`;
            case ExpressionType.MINUS_ASSIGN_EXPRESSION:
                if (expression.left.type === ExpressionType.MEMBER_EXPRESSION)
                    return `уменьшение поля ${expression.left.field} объекта ${this.generateExpressionString(expression.left.owner)} на ${this.generateExpressionString(expression.right)}`;
                return `уменьшение переменной ${this.generateExpressionString(expression.left)} на ${this.generateExpressionString(expression.right)}`;
            case ExpressionType.ASSIGNMENT_EXPRESSION:
                if (expression.left.type === ExpressionType.MEMBER_EXPRESSION)
                    return `присваивание полю ${expression.left.field} объекта ${this.generateExpressionString(expression.left.owner)} значения ${this.generateExpressionString(expression.right)}`;
                return `присваивание переменной ${this.generateExpressionString(expression.left)} значения ${this.generateExpressionString(expression.right)}`;
            default:
                return '[неизвестное выражение]';
        }
    }

    private generateExpressionRow(expression: Expression): AvroraRow {
        return this.createNewActionRow(this.generateExpressionString(expression));
    }

    private generateDeleteStatementRow(statement: DeleteStatement): AvroraRow {
        return this.createNewActionRow(`удаление объекта по указателю ${this.generateExpressionString(statement.deleted)}`);
    }

    private generateForStatementRows(statement: ForStatement): AvroraRow[] {
        const initRow: AvroraRow[] =
            statement.init.nodeType === ASTNodeType.STATEMENT ? this.generateStatementRows(statement.init) : [this.generateExpressionRow(statement.init)];

        const condition: string = this.generateExpressionString(statement.condition);
        const conditionIndex: number = ++this.rowNumber;
        const conditionRow: AvroraRow = this.createRowWith({
            number: conditionIndex,
            next: this.rowNumber + 1, // If condition is true (points to 1st in body)
            condition: condition,
        });

        let body: AvroraRow[] = this.generateBlockStatementRows(statement.body);

        const stepNumber = ++this.rowNumber;
        const stepRow = this.createRowWith({
            number: stepNumber,
            action: this.generateExpressionString(statement.step),
            next: conditionIndex, // points to condition to create cycle
        });

        if (body.length !== 0) {
            this.redirectFragmentExits(body, stepNumber);
            conditionRow.next = body[0].number;
        } else {
            conditionRow.next = stepNumber;
        }

        conditionRow.subrow = this.createRowWith({
            number: conditionIndex,
            next: this.rowNumber + 1, // If condition is false (points to 1st after the cycle)
        });

        return [...initRow, conditionRow, ...body, stepRow];
    }

    private generateDoWhileStatementRows(statement: DoWhileStatement): AvroraRow[] {
        let body: AvroraRow[] = this.generateBlockStatementRows(statement.body);

        const conditionNumber: number = ++this.rowNumber;
        const conditionRow: AvroraRow = this.createRowWith({
            number: conditionNumber,
            next: body.length !== 0 ? body[0].number : conditionNumber, // If condition is true
            condition: this.generateExpressionString(statement.condition),
            subrow: this.createRowWith({
                number: conditionNumber,
                next: this.rowNumber + 1, // If condition is false (points to 1st after the cycle)
            }),
        });

        if (body.length !== 0) this.redirectFragmentExits(body, conditionNumber);

        return [...body, conditionRow];
    }

    private generateWhileStatementRows(statement: WhileStatement): AvroraRow[] {
        const condition: string = this.generateExpressionString(statement.condition);
        const conditionNumber: number = ++this.rowNumber;
        const conditionRow: AvroraRow = this.createRowWith({
            number: conditionNumber,
            next: -1, // If condition is true (will be reassigned later)
            condition: condition,
        });

        let body: AvroraRow[] = this.generateBlockStatementRows(statement.body);

        if (body.length !== 0) {
            this.redirectFragmentExits(body, conditionNumber);
            conditionRow.next = body[0].number;
        } else {
            conditionRow.next = conditionNumber;
        }

        conditionRow.subrow = this.createRowWith({
            number: conditionNumber,
            next: this.rowNumber + 1, // If condition is false (points to 1st after the cycle)
        });

        return [conditionRow, ...body];
    }

    private generateIfStatementRows(statement: IfStatement): AvroraRow[] {
        const conditionNumber: number = ++this.rowNumber;
        const conditionRow: AvroraRow = this.createRowWith({
            number: conditionNumber,
            next: -1, // If condition is true (will be reassigned later)
            condition: this.generateExpressionString(statement.condition),
        });

        const thenBody: AvroraRow[] = this.generateBlockStatementRows(statement.thenStmt);
        const elseBody: AvroraRow[] = statement.elseStmt ? this.generateBlockStatementRows(statement.elseStmt) : [];

        const afterIfNumber: number = this.rowNumber + 1;
        conditionRow.next = thenBody.length > 0 ? thenBody[0].number : afterIfNumber;
        conditionRow.subrow = this.createRowWith({
            number: conditionNumber,
            next: elseBody.length > 0 ? elseBody[0].number : afterIfNumber, // If condition is false
        });

        if (thenBody.length > 0) thenBody[thenBody.length - 1].next = afterIfNumber;

        return [conditionRow, ...thenBody, ...elseBody];
    }

    private generateDeclarationStatementRows(statement: DeclarationStatement): AvroraRow[] {
        const type: string = this.generateTypeExpressionString(statement.varType);
        const varType: string = statement.varType.prefixModifiers.some((modifier) => modifier.kind === PrefixTypeModifierKind.CONST)
            ? 'константы'
            : 'переменной';

        return statement.declarations.map((declaration) => {
            const arrayString = !!declaration.arrayLength ? `массив длиной ${this.generateExpressionString(declaration.arrayLength)}` : '';

            if (declaration.init)
                return this.createNewActionRow(
                    `инициализация ${varType} ${declaration.name}${arrayString.length !== 0 ? ` (${arrayString})` : ''} типа ${type} значением ${this.generateExpressionString(declaration.init)}`,
                );

            return this.createNewActionRow(`объявление ${varType} ${declaration.name}${arrayString.length !== 0 ? ` (${arrayString})` : ''} типа ${type}`);
        });
    }

    private generateBlockStatementRows(statement: BlockStatement): AvroraRow[] {
        return statement.body.flatMap((bodyStatement) => this.generateStatementRows(bodyStatement));
    }

    private generateStatementRows(statement: Statement): AvroraRow[] {
        switch (statement.type) {
            case StatementType.DELETE_STATEMENT:
                return [this.generateDeleteStatementRow(statement)];
            case StatementType.EXPRESSION_STATEMENT:
                return [this.generateExpressionStatementRow(statement)];
            case StatementType.DECLARATION_STATEMENT:
                return this.generateDeclarationStatementRows(statement);
            case StatementType.BLOCK_STATEMENT:
                return this.generateBlockStatementRows(statement);
            case StatementType.IF_STATEMENT:
                return this.generateIfStatementRows(statement);
            case StatementType.WHILE_STATEMENT:
                return this.generateWhileStatementRows(statement);
            case StatementType.FOR_STATEMENT:
                return this.generateForStatementRows(statement);
            case StatementType.DO_WHILE_STATEMENT:
                return this.generateDoWhileStatementRows(statement);

            default:
                throw new Error(`Unexpected statement: '${(statement as BaseStatement).type}'`);
        }
    }

    public generateExpressionStatementRow(statement: ExpressionStatement): AvroraRow {
        return this.generateExpressionRow(statement.expr);
    }

    public generateRowsForAlgorithm(): AvroraRow[] {
        const rows: AvroraRow[] = [];

        while (this.peek() != null) {
            const r = this.generateStatementRows(this.nextOrThrow());
            r.forEach((it) => rows.push(it));
        }

        return rows;
    }
}
