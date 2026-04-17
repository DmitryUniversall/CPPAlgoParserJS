import BaseDescription from '../BaseDescription';
import DescriptionType from '../DescriptionType';
import AvroraRow from '../../AvroraRow';

export default interface FunctionDescription extends BaseDescription {
    type: DescriptionType.FUNCTION_DECLARATION;
    name: string;
    params: string;
    returnType: string;
    body: AvroraRow[];
    description: string;
}
