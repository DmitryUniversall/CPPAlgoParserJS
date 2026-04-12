import FunctionDescription from '../FunctionDescription';
import AccessModifierType from '../../../../../../../core/entities/modifier/access/AccessModifierType';

export default interface MethodDescription {
    name: string;
    description: string;
    accessModifier: AccessModifierType;
    functionDescription: FunctionDescription;
    isConstructor: boolean
}
