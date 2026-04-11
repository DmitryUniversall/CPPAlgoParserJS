import AccessModifierType from '../../../../../../../core/entities/modifier/access/AccessModifierType';

export default interface BaseClassDescription {
    isVirtual: boolean;
    accessModifier: AccessModifierType;
    baseClassName: string;
}
