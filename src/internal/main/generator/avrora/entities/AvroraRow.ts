export default interface AvroraRow {
    number: number;
    action: string | null;
    next: number;
    condition: string | null;
    comment: string | null;
    subrow: AvroraRow | null;
}
