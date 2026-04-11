import ConstructorInitializerTargetType from './ConstructorInitializerTargetType';
import ClassName from '../../ClassName';
import ConstructorInitializerValue from './ConstructorInitializerValue';

export default interface BaseConstructorInitializer {
    targetType: ConstructorInitializerTargetType;
    targetName: ClassName | string;
    value: ConstructorInitializerValue;
}
