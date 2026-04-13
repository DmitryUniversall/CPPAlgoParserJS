import TypeExpression from '../../../core/entities/ast/type/TypeExpression';

export default interface TypeArgsLookAheadResult {
    args: TypeExpression[];
    endPosition: number;
}
