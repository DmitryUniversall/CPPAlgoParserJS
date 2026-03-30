import Row from './Row.js';
import { OPERATORS } from '../parser/lexer/operators.js';

export default class Generator {
    constructor(nodes) {
        this.nodes = nodes;
        this.position = 0;
        this.rowNumber = 0;
    }

    peek(required = false) {
        if (this.position >= this.nodes.length && required) throw new Error('Next node is required, but was not found');
        return this.position < this.nodes.length ? this.nodes[this.position] : null;
    }

    next(required = false) {
        if (this.position >= this.nodes.length && required) throw new Error('Next node is required, but was not found');
        return this.position < this.nodes.length ? this.nodes[this.position++] : null;
    }

    generate() {
        const rows = [];

        while (this.peek() != null) {
            const r = this.generateStatementRows(this.next());
            r.forEach((it) => rows.push(it));
        }

        return rows;
    }

    generateStatementRows(statement) {
        if (statement.nodeType !== 'STATEMENT') throw new Error(`Unexpected node type: '${statement.nodeType}'`);

        switch (statement.type) {
            case 'EXPRESSION_STATEMENT':
                return [this.generateExpressionStatementRow(statement)];
            case 'DELETE_STATEMENT':
                return [this.generateDeleteStatementRow(statement)];

            case 'DECLARATION_STATEMENT':
                return this.generateDeclarationStatementRows(statement);
            case 'IF_STATEMENT':
                return this.generateIfStatementRows(statement);
            case 'WHILE_STATEMENT':
                return this.generateWhileStatementRows(statement);
            case 'FOR_STATEMENT':
                return this.generateForStatementRows(statement);
            case 'BLOCK_STATEMENT':
                return this.generateBlockStatementRows(statement);

            default:
                throw new Error(`Unexpected statement: '${statement.type}'`);
        }
    }

    generateBlockStatementRows(statement) {
        const result = [];

        statement.body.map((stmt) => {
            this.generateStatementRows(stmt).forEach((row) => result.push(row));
        });

        return result;
    }

    generateForStatementRows(statement) {
        const initRow =
            statement.init.nodeType === 'STATEMENT'
                ? this.generateStatementRows(statement.init)[0]
                : this.generateExpressionStatementRow(statement.init);

        const condition = this.generateExpression(statement.condition);
        const conditionIndex = ++this.rowNumber;
        const conditionRow = new Row(
            conditionIndex,
            null,
            this.rowNumber + 1, // 1st body
            condition,
            null,
            new Row(conditionIndex, null, undefined, null, null, null),
        );

        let body = this.generateBlockStatementRows(statement.body);

        const stepRow = new Row(++this.rowNumber, this.generateExpression(statement.step), conditionIndex, null, null);
        stepRow.next = conditionIndex;

        conditionRow.subrow.next = this.rowNumber + 1;
        return [initRow, conditionRow, ...body, stepRow];
    }

    generateWhileStatementRows(statement) {
        const condition = this.generateExpression(statement.condition);
        const conditionIndex = ++this.rowNumber;
        const conditionRow = new Row(
            conditionIndex,
            null,
            this.rowNumber + 1, // 1st body
            condition,
            null,
            new Row(conditionIndex, null, undefined, null, null, null),
        );
        let body = this.generateBlockStatementRows(statement.body);

        conditionRow.subrow.next = this.rowNumber + 1;
        return [conditionRow, ...body];
    }

    generateIfStatementRows(statement) {
        const condition = this.generateExpression(statement.condition);
        const conditionIndex = ++this.rowNumber;
        const conditionRow = new Row(
            conditionIndex,
            null,
            this.rowNumber + 1, // 1st body
            condition,
            null,
            null,
        );

        let thenBody = this.generateBlockStatementRows(statement.thenBody);

        let elseBody = [];
        if (statement.elseBody) {
            elseBody = this.generateBlockStatementRows(statement.elseBody);
            thenBody[thenBody.length - 1].next = elseBody[elseBody.length - 1].number + 1;
            conditionRow.subrow = new Row(conditionIndex, null, elseBody[0].number, null, null, null);
        } else {
            conditionRow.subrow = new Row(conditionIndex, null, thenBody[thenBody.length - 1].next, null, null, null);
        }

        return [conditionRow, ...thenBody, ...elseBody];
    }

    generateDeleteStatementRow(statement) {
        return new Row(
            ++this.rowNumber,
            'удаление объекта по указателю ' + this.generateExpression(statement.deleted),
            this.rowNumber + 1,
            null,
            null,
            null,
        );
    }

    generateDeclarationStatementRows(statement) {
        const type = this.generateType(statement.varTypeExpr);
        const varType = statement.varTypeExpr.prefixModifiers.includes('const') ? 'константы' : 'переменной';

        return statement.declarations.map((declaration) => {
            if (declaration.init) {
                return new Row(
                    ++this.rowNumber,
                    `инициализация ${varType} ${declaration.name} типа ${type} значением ${this.generateExpression(declaration.init)}`,
                    this.rowNumber + 1,
                    null,
                    null,
                    null,
                );
            }

            return new Row(++this.rowNumber, `объявление ${varType} ${declaration.name} типа ${type}`, this.rowNumber + 1, null, null, null);
        });
    }

    generateExpressionStatementRow(statement) {
        return new Row(++this.rowNumber, this.generateExpression(statement.expr), this.rowNumber + 1, null, null, null);
    }

    getInputVarsFromExpression(expression, found) {
        if (expression.type !== 'BINARY_OPERATION_EXPRESSION' || expression.operator !== OPERATORS.SHR.literal) return found;
        if (expression.right.type === 'IDENT_EXPRESSION') found = [expression.right.value, ...found];

        if (!expression.left) return found;
        return this.getInputVarsFromExpression(expression.left, found);
    }

    isInputExpression(expression) {
        if (expression.type === 'IDENT_EXPRESSION' && expression.value === 'cin') return true;
        if (!expression.left) return false;
        if (expression.left.type !== 'BINARY_OPERATION_EXPRESSION' && expression.left.type !== 'IDENT_EXPRESSION') return false;
        if (expression.type === 'BINARY_OPERATION_EXPRESSION' && expression.operator !== OPERATORS.SHR.literal) return false;
        return this.isInputExpression(expression.left);
    }

    getOutputVarsFromExpression(expression, found) {
        if (expression.type !== 'BINARY_OPERATION_EXPRESSION' || expression.operator !== OPERATORS.SHL.literal) return found;
        found = [this.generateExpression(expression.right), ...found];

        if (!expression.left) return found;
        return this.getOutputVarsFromExpression(expression.left, found);
    }

    isOutputExpression(expression) {
        if (expression.type === 'IDENT_EXPRESSION' && expression.value === 'cout') return true;
        if (!expression.left) return false;
        if (expression.left.type !== 'BINARY_OPERATION_EXPRESSION' && expression.left.type !== 'IDENT_EXPRESSION') return false;
        if (expression.type === 'BINARY_OPERATION_EXPRESSION' && expression.operator !== OPERATORS.SHL.literal) return false;
        return this.isOutputExpression(expression.left);
    }

    generateType(type) {
        return `${type.prefixModifiers.length !== 0 ? type.prefixModifiers.join(' ') + ' ' : ''}${type.typeName}${type.typeParameters.length !== 0 ? `<${type.typeParameters.map((it) => this.generateType(it))}>` : ''}${type.postfixModifiers.join('')}`;
    }

    generateExpression(expression) {
        switch (expression.type) {
            case 'IDENT_EXPRESSION':
                return expression.value;

            case 'NUMBER_EXPRESSION':
                return 'число ' + expression.value;

            case 'STRING_LITERAL_EXPRESSION':
                return `"${expression.value}"`;

            case 'KEYWORD_EXPRESSION':
                return expression.keyword.literal;

            case 'BINARY_OPERATION_EXPRESSION':
                if (this.isInputExpression(expression)) return 'Ввод: ' + this.getInputVarsFromExpression(expression, []).join(', ');
                if (this.isOutputExpression(expression)) return 'Вывод: ' + this.getOutputVarsFromExpression(expression, []).join(' + ');
                return this.generateExpression(expression.left) + ' ' + expression.operator + ' ' + this.generateExpression(expression.right);

            case 'POSTFIX_INCREMENT_EXPRESSION':
                return 'увеличение ' + this.generateExpression(expression.expr);

            case 'CALL_EXPRESSION':
                return this.generateCallExpression(expression);

            case 'MEMBER_EXPRESSION':
                return this.generateExpression(expression.owner) + '.' + expression.name;

            case 'PTR_MEMBER_EXPRESSION':
                return this.generateExpression(expression.owner) + '->' + expression.name;

            case 'INDEX_EXPRESSION':
                return 'элемент ' + this.generateExpression(expression.owner) + ' по индексу ' + this.generateExpression(expression.expr);

            case 'NEW_EXPRESSION':
                return 'создание объекта ' + this.generateType(expression.typeExpr);

            case 'ASSIGNMENT_EXPRESSION':
                return 'присваивание ' + this.generateExpression(expression.left) + ' = ' + this.generateExpression(expression.right);

            default:
                return '[неизвестное выражение]';
        }
    }

    generateCallExpression(expression) {
        let args = expression.args.map((it) => this.generateExpression(it)).join(', ');

        if (['PTR_MEMBER_EXPRESSION', 'MEMBER_EXPRESSION'].includes(expression.called.type)) {
            return (
                'вызов метода ' +
                expression.called.name +
                ' у объекта ' +
                this.generateExpression(expression.called.owner) +
                (args ? ' с параметрами: ' + args : '')
            );
        }

        return 'вызов функции ' + this.generateExpression(expression.called) + (args ? ' с параметрами: ' + args : '');
    }
}
