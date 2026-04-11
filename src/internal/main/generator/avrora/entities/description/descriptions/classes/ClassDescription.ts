import BaseClassDescription from './BaseClassDescription';
import FieldDescription from './FieldDescription';
import MethodDescription from './MethodDescription';

export default interface ClassDescription {
    name: string;
    description: string;
    bases: BaseClassDescription[];
    fields: FieldDescription[];
    methods: MethodDescription[];
}
