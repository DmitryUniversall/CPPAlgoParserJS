import TypeExpression from '../../../core/entities/ast/type/TypeExpression';

export default interface TypeLookAheadResult {
    typeExpression: TypeExpression;
    endPosition: number;
}
