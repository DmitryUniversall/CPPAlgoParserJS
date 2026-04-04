export function repeat(times: number, callback: (index: number) => void): void {
    for (let index = 0; index < times; index++) callback(index);
}
