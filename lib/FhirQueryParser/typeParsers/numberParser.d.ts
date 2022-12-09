export interface NumberSearchValue {
    prefix: string;
    number: number;
    implicitRange: {
        start: number;
        end: number;
    };
}
export declare const parseNumberSearchValue: (param: string) => NumberSearchValue;
