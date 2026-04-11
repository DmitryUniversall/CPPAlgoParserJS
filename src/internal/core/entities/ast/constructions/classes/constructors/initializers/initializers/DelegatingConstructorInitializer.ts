import BaseConstructorInitializer from '../BaseConstructorInitializer';
import ConstructorInitializerTargetType from '../ConstructorInitializerTargetType';
import ClassName from '../../../ClassName';

export default interface DelegatingConstructorInitializer extends BaseConstructorInitializer {
    targetType: ConstructorInitializerTargetType.DELEGATING;
    targetName: ClassName;
}
