import OperatorAssoc from './OperatorAssoc';

export default interface OperatorUsageInfo {
    precedence: number;
    assoc: OperatorAssoc;
}
