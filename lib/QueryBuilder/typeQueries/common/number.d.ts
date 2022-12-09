interface FhirNumber {
    number: number;
    implicitRange: {
        start: number;
        end: number;
    };
}
export declare const parseNumber: (numberString: string) => FhirNumber;
export {};
