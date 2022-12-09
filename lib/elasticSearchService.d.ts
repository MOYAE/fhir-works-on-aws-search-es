import { Search, TypeSearchRequest, SearchResponse, GlobalSearchRequest, SearchFilter, FhirVersion } from 'fhir-works-on-aws-interface';
import { Client, RequestParams } from '@elastic/elasticsearch';
export declare type Query = {
    resourceType: string;
    queryRequest: RequestParams.Search<Record<string, any>>;
};
export declare class ElasticSearchService implements Search {
    private readonly esClient;
    private readonly searchFiltersForAllQueries;
    private readonly cleanUpFunction;
    private readonly fhirVersion;
    private readonly fhirSearchParametersRegistry;
    private readonly enableMultiTenancy;
    private readonly useKeywordSubFields;
    /**
     * @param searchFiltersForAllQueries - If you are storing both History and Search resources
     * in your elastic search you can filter out your History elements by supplying a list of SearchFilters
     *
     * @param cleanUpFunction - If you are storing non-fhir related parameters pass this function to clean
     * the return ES objects
     * @param fhirVersion
     * @param compiledImplementationGuides - The output of ImplementationGuides.compile.
     * This parameter enables support for search parameters defined in Implementation Guides.
     * @param esClient
     * @param options.enableMultiTenancy - whether or not to enable multi-tenancy. When enabled a tenantId is required for all requests.
     * @param options.useKeywordSubFields - whether or not to append `.keyword` to fields in search queries. You should enable this if you do dynamic mapping. NOTE: Parameter`id` will not be affected by this due to it being of `keyword` type by default
     */
    constructor(searchFiltersForAllQueries?: SearchFilter[], cleanUpFunction?: (resource: any) => any, fhirVersion?: FhirVersion, compiledImplementationGuides?: any, esClient?: Client, { enableMultiTenancy, useKeywordSubFields, }?: {
        enableMultiTenancy?: boolean;
        useKeywordSubFields?: boolean;
    });
    private assertValidTenancyMode;
    getCapabilities(): Promise<import("fhir-works-on-aws-interface").SearchCapabilityStatement>;
    private getFilters;
    typeSearch(request: TypeSearchRequest): Promise<SearchResponse>;
    private getChainedParametersQuery;
    private executeQuery;
    private executeQueries;
    private hitsToSearchEntries;
    private processSearchInclusions;
    private processIterativeSearchInclusions;
    private createURL;
    globalSearch(request: GlobalSearchRequest): Promise<SearchResponse>;
    validateSubscriptionSearchCriteria(searchCriteria: string): void;
    private static buildSingleElasticSearchFilterPart;
    private static buildElasticSearchFilterPart;
    /**
     * ES filter is created where all 'AND' filters are required and at least 1 'OR' condition is met
     * @returns the `filter` part of the ES query
     */
    private static buildElasticSearchFilter;
}
