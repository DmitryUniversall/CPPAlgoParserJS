import Expression from '../../../expressions/Expression';

export default interface DeclarationInfo {
    name: string;
    init: Expression | null;
    arrayLength: Expression | null;
}
