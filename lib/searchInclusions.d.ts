import { FHIRSearchParametersRegistry } from './FHIRSearchParametersRegistry';
import { Query } from './elasticSearchService';
/**
 * @example
 * The following query:
 * https://my-fwoa-server/ImmunizationRecommendation?_include=ImmunizationRecommendation:information:Patient
 * results in:
 * {
 *   type: '_include',
 *   isWildcard: false,
 *   sourceResource: 'ImmunizationRecommendation',
 *   searchParameter: 'information',
 *   path: 'ImmunizationRecommendation.recommendation.supportingPatientInformation'
 *   targetResourceType: 'Patient'
 * }
 *
 * path is the actual object path where the reference value can be found. All valid search params have a path.
 * path is optional since InclusionSearchParameter is first built from the query params and the path is added afterwards if it is indeed a valid search parameter.
 */
export declare type InclusionSearchParameterType = '_include' | '_revinclude';
export declare type InclusionSearchParameter = {
    type: InclusionSearchParameterType;
    isWildcard: false;
    isIterate?: true;
    sourceResource: string;
    searchParameter: string;
    path?: string;
    targetResourceType?: string;
};
export declare type WildcardInclusionSearchParameter = {
    type: InclusionSearchParameterType;
    isWildcard: true;
    isIterate?: true;
};
export declare const getIncludeReferencesFromResources: (includes: InclusionSearchParameter[], resources: any[]) => {
    resourceType: string;
    id: string;
}[];
export declare const getRevincludeReferencesFromResources: (revIncludeParameters: InclusionSearchParameter[], resources: any[]) => {
    references: string[];
    revinclude: InclusionSearchParameter;
}[];
export declare const buildIncludeQuery: (resourceType: string, resourceIds: string[], filterRulesForActiveResources: any[]) => Query;
export declare const buildRevIncludeQuery: (revIncludeSearchParameter: InclusionSearchParameter, references: string[], filterRulesForActiveResources: any[], useKeywordSubFields: boolean) => Query;
export declare const buildIncludeQueries: (inclusionSearchParameters: (InclusionSearchParameter | WildcardInclusionSearchParameter)[], resources: any[], filterRulesForActiveResources: any[], fhirSearchParametersRegistry: FHIRSearchParametersRegistry, iterate?: true | undefined) => Query[];
export declare const buildRevIncludeQueries: (inclusionSearchParameters: (InclusionSearchParameter | WildcardInclusionSearchParameter)[], resources: any[], filterRulesForActiveResources: any[], fhirSearchParametersRegistry: FHIRSearchParametersRegistry, useKeywordSubFields: boolean, iterate?: true | undefined) => Query[];
