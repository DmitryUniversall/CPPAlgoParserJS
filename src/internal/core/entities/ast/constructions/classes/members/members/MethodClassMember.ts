import BaseClassMember from '../BaseClassMember';
import ClassMemberType from '../ClassMemberType';
import MethodDeclaration from '../../methods/MethodDeclaration';

export default interface MethodClassMember extends BaseClassMember {
    type: ClassMemberType.METHOD;
    methodDeclaration: MethodDeclaration;
}
