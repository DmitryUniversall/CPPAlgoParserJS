import MemberConstructorInitializer from './initializers/MemberConstructorInitializer';
import BaseClassConstructorInitializer from './initializers/BaseClassConstructorInitializer';
import DelegatingConstructorInitializer from './initializers/DelegatingConstructorInitializer';

type ConstructorInitializer = MemberConstructorInitializer | BaseClassConstructorInitializer | DelegatingConstructorInitializer;

export default ConstructorInitializer;
