import BaseClassMember from '../BaseClassMember';
import ClassMemberType from '../ClassMemberType';
import FunctionDeclaration from '../../../functions/FunctionDeclaration';

export default interface MethodClassMember extends BaseClassMember {
    type: ClassMemberType.METHOD;
    functionDeclaration: FunctionDeclaration;
}
