import ConstructorInitializerValueType from './ConstructorInitializerValueType';
import Expression from '../../../../expressions/Expression';

export default interface ConstructorInitializerValue {
    type: ConstructorInitializerValueType;
    args: Expression[];
}
