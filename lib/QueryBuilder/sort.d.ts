import { FHIRSearchParametersRegistry } from '../FHIRSearchParametersRegistry';
interface SortParameter {
    order: 'asc' | 'desc';
    searchParam: string;
}
export declare const parseSortParameter: (param: string) => SortParameter[];
export declare const buildSortClause: (fhirSearchParametersRegistry: FHIRSearchParametersRegistry, resourceType: string, sortQueryParam: string | string[]) => any[];
export {};
