export interface Range {
    start: number;
    end: number;
}
export declare const compareNumberToRange: (prefix: string, searchParamRange: Range, resourceValue: number) => boolean;
export declare const compareRanges: (prefix: string, searchParamRange: Range, resourceRange: Range) => any;
/**
 * When a comparison prefix in the set lgt, lt, ge, le, sa & eb is provided, the implicit precision of the number is ignored,
 * and they are treated as if they have arbitrarily high precision. https://www.hl7.org/fhir/search.html#number
 * @param prefix
 * @param number
 * @param range
 */
export declare const applyPrefixRulesToRange: (prefix: string, number: number, range: Range) => Range;
