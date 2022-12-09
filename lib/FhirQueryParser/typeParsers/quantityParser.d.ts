export interface QuantitySearchValue {
    prefix: string;
    system: string;
    code: string;
    number: number;
    implicitRange: {
        start: number;
        end: number;
    };
}
export declare const parseQuantitySearchValue: (param: string) => QuantitySearchValue;
