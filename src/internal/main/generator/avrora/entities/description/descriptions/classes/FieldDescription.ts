import AccessModifierType from '../../../../../../../core/entities/modifier/access/AccessModifierType';

export default interface FieldDescription {
    name: string;
    description: string;
    typeString: string;
    accessModifier: AccessModifierType;
}
