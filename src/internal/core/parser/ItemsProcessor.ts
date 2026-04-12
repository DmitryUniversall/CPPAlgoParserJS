export default class ItemsProcessor<T extends any> {
    protected readonly items: T[];
    protected readonly source: string;
    protected position: number;

    constructor(source: string, items: T[], startPosition: number) {
        this.items = items;
        this.source = source;
        this.position = startPosition;
    }

    public get currentPosition(): number {
        return this.position;
    }

    protected hasNext(): boolean {
        return this.position < this.items.length;
    }

    protected peek(): T | null {
        return this.hasNext() ? this.items[this.position] : null;
    }

    protected peekOffset(offset: number): T | null {
        const result: T | undefined = this.items[this.position + offset];
        return result !== undefined ? result : null;
    }

    protected peekOrThrow(): T {
        if (!this.hasNext()) throw new Error('Next token is required, but was not found (end of file)');
        return this.peek()!!;
    }

    protected next(): T | null {
        return this.hasNext() ? this.items[this.position++] : null;
    }

    protected nextOrThrow(): T {
        if (!this.hasNext()) throw new Error('Next token is required, but was not found (end of file)');
        return this.next()!!;
    }
}
