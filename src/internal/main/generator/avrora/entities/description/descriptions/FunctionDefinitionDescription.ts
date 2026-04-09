import BaseObjectDescription from '../BaseObjectDescription';
import ObjectDescriptionType from '../ObjectDescriptionType';
import AvroraRow from '../../AvroraRow';

export default interface FunctionDefinitionDescription extends BaseObjectDescription {
    type: ObjectDescriptionType.FUNCTION_DEFINITION;
    name: string;
    params: string;
    returnType: string;
    body: AvroraRow[];
}
