import AvroraRow from '../AvroraRow';
import AvroraGeneratorJumpKind from './AvroraGeneratorJumpKind';

export default interface GeneratedAvroraRow extends AvroraRow {
    jumpKind: AvroraGeneratorJumpKind | null;
}
