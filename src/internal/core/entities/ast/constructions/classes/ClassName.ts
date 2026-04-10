import TypeExpression from '../../type/TypeExpression';

export default interface ClassName {
    name: string;
    genericParams: TypeExpression[];
}
