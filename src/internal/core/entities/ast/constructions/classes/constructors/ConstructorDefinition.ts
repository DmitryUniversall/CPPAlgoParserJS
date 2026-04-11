import CallableDefinition from '../../callable/definitions/CallableDefinition';
import ConstructorInitializer from './initializers/ConstructorInitializer';

export default interface ConstructorDefinition {
    callableDefinition: CallableDefinition | null;
    initializerList: ConstructorInitializer[] | null;
}
