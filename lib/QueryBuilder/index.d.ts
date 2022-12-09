import { TypeSearchRequest } from 'fhir-works-on-aws-interface';
import { FHIRSearchParametersRegistry } from '../FHIRSearchParametersRegistry';
import { QueryParam } from '../FhirQueryParser';
export declare const buildQueryForAllSearchParameters: (fhirSearchParametersRegistry: FHIRSearchParametersRegistry, request: TypeSearchRequest, searchParams: QueryParam[], useKeywordSubFields: boolean, additionalFilters?: any[], chainedParameterQuery?: any) => any;
export { buildSortClause } from './sort';
