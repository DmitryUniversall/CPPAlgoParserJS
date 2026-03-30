export default class Row {
    constructor(number, action, next, condition, comment, subrow) {
        this.number = number;
        this.action = action;
        this.next = next;
        this.condition = condition;
        this.comment = comment;
        this.subrow = subrow;
    }
}
