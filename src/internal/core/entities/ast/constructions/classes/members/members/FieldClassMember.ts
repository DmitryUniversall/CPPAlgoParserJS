import BaseClassMember from '../BaseClassMember';
import ClassMemberType from '../ClassMemberType';
import DeclarationStatement from '../../../../statements/statements/declaration/DeclarationStatement';

export default interface FieldClassMember extends BaseClassMember {
    type: ClassMemberType.FIELD;
    statement: DeclarationStatement;
}
