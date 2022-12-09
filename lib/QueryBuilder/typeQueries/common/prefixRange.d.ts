interface NumberRange {
    start: number;
    end: number;
}
interface DateRange {
    start: Date;
    end: Date;
}
export declare const prefixRangeNumber: (prefix: string, number: number, implicitRange: NumberRange, path: string) => any;
export declare const prefixRangeDate: (prefix: string, range: DateRange, path: string) => any;
export {};
