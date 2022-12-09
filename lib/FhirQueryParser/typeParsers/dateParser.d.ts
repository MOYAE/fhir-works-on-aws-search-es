export interface DateSearchValue {
    prefix: string;
    range: {
        start: Date;
        end: Date;
    };
}
export declare const parseDateSearchValue: (param: string) => DateSearchValue;
