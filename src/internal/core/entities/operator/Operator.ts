import OperatorType from './OperatorType';
import OperatorUsageInfo from './OperatorUsageInfo';

export default interface Operator {
    type: OperatorType;
    literal: string;
    prefix?: OperatorUsageInfo;
    infix?: OperatorUsageInfo;
    postfix?: OperatorUsageInfo;
}
