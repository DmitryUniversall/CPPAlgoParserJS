import Expression from '../../../core/entities/ast/expressions/Expression';
import ExpressionType from '../../../core/entities/ast/expressions/ExpressionType';
import { operators } from '../../../core/entities/operator/operators/operators';
import BinaryOperationExpression from '../../../core/entities/ast/expressions/expressions/infix/BinaryOperationExpression';
import CallExpression from '../../../core/entities/ast/expressions/expressions/other/CallExpression';
import { generateAvroraTypeExpressionString } from './utils/generate';

export default class AvroraExpressionGenerator {
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

    private generateCallArgs(args: Expression[]): string {
        if (args.length === 0) return '';
        return args.map((it) => this.generateExpressionString(it)).join(', ');
    }

    private generateCallExpressionString(expression: CallExpression): string {
        let args: string = this.generateCallArgs(expression.args);

        if (expression.called.type === ExpressionType.NEW_EXPRESSION)
            return `выделение памяти под объект типа ${generateAvroraTypeExpressionString(expression.called.typeExpr)}, получение указателя и вызов конструктора${args ? ' с параметрами: ' + args : ''}`;

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

    public generateExpressionString(expression: Expression): string {
        switch (expression.type) {
            case ExpressionType.IDENT_EXPRESSION:
                return expression.identifier;
            case ExpressionType.NUMBER_EXPRESSION:
                return expression.number;
            case ExpressionType.KEYWORD_EXPRESSION:
                return expression.keyword.literal;
            case ExpressionType.STRING_LITERAL_EXPRESSION:
                return `"${expression.literal}"`;
            case ExpressionType.BOOLEAN_NEGATE_EXPRESSION:
                return `"отрицание (${expression.expr})"`;
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
                return `выделение памяти под объект типа ${generateAvroraTypeExpressionString(expression.typeExpr)} и получение указателя`;
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
}
