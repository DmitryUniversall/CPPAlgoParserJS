import Expression from '../../../../core/entities/ast/expressions/Expression';
import TypeExpression from '../../../../core/entities/ast/type/TypeExpression';
import AvroraExpressionGenerator from '../AvroraExpressionGenerator';
import AvroraTypeGenerator from '../AvroraTypeGenerator';

export function generateAvroraExpressionString(expression: Expression): string {
    const generator = new AvroraExpressionGenerator();
    return generator.generateExpressionString(expression);
}

export function generateAvroraTypeExpressionString(typeExpression: TypeExpression): string {
    const generator = new AvroraTypeGenerator();
    return generator.generateTypeExpressionString(typeExpression);
}
