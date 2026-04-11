import ConstructorInitializerTargetType from '../ConstructorInitializerTargetType';
import BaseConstructorInitializer from '../BaseConstructorInitializer';
import ClassName from '../../../ClassName';

export default interface BaseClassConstructorInitializer extends BaseConstructorInitializer {
    targetType: ConstructorInitializerTargetType.BASE_CLASS;
    targetName: ClassName;
}
