import BaseClassMember from '../BaseClassMember';
import ClassMemberType from '../ClassMemberType';
import FunctionParameter from '../../../functions/params/FunctionParameter';
import BlockStatement from '../../../../statements/statements/BlockStatement';

export default interface ConstructorClassMember extends BaseClassMember {
    type: ClassMemberType.CONSTRUCTOR;
    className: string;
    params: FunctionParameter[];
    body: BlockStatement;
}
