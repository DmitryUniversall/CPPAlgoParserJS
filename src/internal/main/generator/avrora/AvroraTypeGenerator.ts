import TypeExpression from '../../../core/entities/ast/type/TypeExpression';

export default class AvroraTypeGenerator {
    public generateTypeExpressionString(typeExpression: TypeExpression): string {
        return `${typeExpression.prefixModifiers.length !== 0 ? typeExpression.prefixModifiers.flatMap((it) => it.literal).join(' ') + ' ' : ''}${typeExpression.typeName.name}${typeExpression.typeParameters.length !== 0 ? `<${typeExpression.typeParameters.map((it) => this.generateTypeExpressionString(it))}>` : ''}${typeExpression.postfixModifiers.flatMap((it) => it.literal).join('')}`;
    }
}
