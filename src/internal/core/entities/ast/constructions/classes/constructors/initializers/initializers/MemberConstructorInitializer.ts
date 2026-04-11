import BaseConstructorInitializer from '../BaseConstructorInitializer';
import ConstructorInitializerTargetType from '../ConstructorInitializerTargetType';

export default interface MemberConstructorInitializer extends BaseConstructorInitializer {
    targetType: ConstructorInitializerTargetType.MEMBER;
    targetName: string;
}
