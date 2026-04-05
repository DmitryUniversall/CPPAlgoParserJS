export default interface Row {
    number: number;
    action: string | null;
    next: number;
    condition: string | null;
    comment: string | null;
    subrow: Row | null;
}
