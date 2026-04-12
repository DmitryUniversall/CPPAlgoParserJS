import AvroraRow from '../AvroraRow';
import AvroraGeneratorJumpKind from './AvroraGeneratorJumpKind';

export default interface CreateRowSchema {
    number: number;
    action?: string | null;
    next: number;
    condition?: string | null;
    comment?: string | null;
    subrow?: AvroraRow | null;
    jumpKind?: AvroraGeneratorJumpKind | null;
}
