import { FHIRSearchParametersRegistry, SearchParam } from '../FHIRSearchParametersRegistry';
import { DateSearchValue } from './typeParsers/dateParser';
import { TokenSearchValue } from './typeParsers/tokenParser';
import { NumberSearchValue } from './typeParsers/numberParser';
import { QuantitySearchValue } from './typeParsers/quantityParser';
import { ReferenceSearchValue } from './typeParsers/referenceParser';
import { InclusionSearchParameter, WildcardInclusionSearchParameter } from '../searchInclusions';
export { DateSearchValue, TokenSearchValue, NumberSearchValue, QuantitySearchValue };
export declare type StringLikeSearchValue = string;
interface BaseQueryParam {
    name: string;
    modifier?: string;
    searchParam: SearchParam;
}
export interface StringQueryParam extends BaseQueryParam {
    type: 'string';
    parsedSearchValues: StringLikeSearchValue[];
}
export interface CompositeQueryParam extends BaseQueryParam {
    type: 'composite';
    parsedSearchValues: StringLikeSearchValue[];
}
export interface SpecialQueryParam extends BaseQueryParam {
    type: 'special';
    parsedSearchValues: StringLikeSearchValue[];
}
export interface UriQueryParam extends BaseQueryParam {
    type: 'uri';
    parsedSearchValues: StringLikeSearchValue[];
}
export interface DateQueryParam extends BaseQueryParam {
    type: 'date';
    parsedSearchValues: DateSearchValue[];
}
export interface NumberQueryParam extends BaseQueryParam {
    type: 'number';
    parsedSearchValues: NumberSearchValue[];
}
export interface QuantityQueryParam extends BaseQueryParam {
    type: 'quantity';
    parsedSearchValues: QuantitySearchValue[];
}
export interface ReferenceQueryParam extends BaseQueryParam {
    type: 'reference';
    parsedSearchValues: ReferenceSearchValue[];
}
export interface TokenQueryParam extends BaseQueryParam {
    type: 'token';
    parsedSearchValues: TokenSearchValue[];
}
export declare type QueryParam = StringQueryParam | DateQueryParam | NumberQueryParam | QuantityQueryParam | ReferenceQueryParam | TokenQueryParam | CompositeQueryParam | SpecialQueryParam | UriQueryParam;
export interface ParsedFhirQueryParams {
    resourceType: string;
    searchParams: QueryParam[];
    inclusionSearchParams?: (InclusionSearchParameter | WildcardInclusionSearchParameter)[];
    chainedSearchParams?: {
        [name: string]: string[];
    };
    otherParams?: {
        [name: string]: string[];
    };
}
/**
 * Parse and validate the search query parameters. This method ignores _include, _revinclude, _sort, and chained parameters
 * @param fhirSearchParametersRegistry - instance of FHIRSearchParametersRegistry
 * @param resourceType - FHIR resource type used as base in the search request
 * @param queryParams - search request query params object. It is expected to have the shape used by https://www.npmjs.com/package/qs
 */
export declare const parseQuery: (fhirSearchParametersRegistry: FHIRSearchParametersRegistry, resourceType: string, queryParams: any) => ParsedFhirQueryParams;
/**
 * Parse and validate the search query parameters.
 * @param fhirSearchParametersRegistry - instance of FHIRSearchParametersRegistry
 * @param searchCriteria - Search criteria without the base url. Example: "Observation?code=http://loinc.org|1975-2"
 */
export declare const parseQueryString: (fhirSearchParametersRegistry: FHIRSearchParametersRegistry, searchCriteria: string) => ParsedFhirQueryParams;
