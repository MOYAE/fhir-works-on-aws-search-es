import { Client } from '@elastic/elasticsearch';
export declare class SearchMappingsManager {
    private readonly searchMappings;
    private readonly numberOfShards;
    private readonly searchClient;
    private readonly ignoreMappingsErrorsForExistingIndices;
    /**
     * @param options
     *
     * @param options.searchMappings - search mappings for all FHIR resource types
     *
     * @param options.numberOfShards - number of shards for each new index created. See the documentation for guidance on how to choose the right number:
     * https://docs.aws.amazon.com/opensearch-service/latest/developerguide/sizing-domains.html#bp-sharding
     *
     * @param options.searchClient - optionally provide your own search client instance
     *
     * @param options.ignoreMappingsErrorsForExistingIndices - optionally ignore errors for update mappings requests and log them as warnings.
     * This can be convenient if you have existing indices with conflicting mappings
     */
    constructor({ searchMappings, numberOfShards, searchClient, ignoreMappingsErrorsForExistingIndices, }: {
        searchMappings: {
            [resourceType: string]: any;
        };
        numberOfShards: number;
        searchClient?: Client;
        ignoreMappingsErrorsForExistingIndices?: boolean;
    });
    /**
     * Updates the mappings for all the FHIR resource types. If an index does not exist, it is created
     */
    createOrUpdateMappings(): Promise<void>;
    indexExists(resourceType: string): Promise<boolean>;
    updateMapping(resourceType: string, mapping: any): Promise<import("@elastic/elasticsearch").ApiResponse<Record<string, any>, unknown>>;
    createIndexWithMapping(resourceType: string, mapping: any): Promise<import("@elastic/elasticsearch").ApiResponse<Record<string, any>, unknown>>;
}
