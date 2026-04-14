import TypeExpression from '../../../type/TypeExpression';
import Expression from '../../../expressions/Expression';

export default interface CallableParameter {
    name: string;
    type: TypeExpression;
    defaultExpr: Expression | null;
}
