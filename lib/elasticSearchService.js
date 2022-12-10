"use strict";
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElasticSearchService = void 0;
/* eslint-disable no-underscore-dangle */
const url_1 = __importDefault(require("url"));
const errors_1 = require("@elastic/elasticsearch/lib/errors");
const lodash_1 = require("lodash");
const fhir_works_on_aws_interface_1 = require("fhir-works-on-aws-interface");
const elasticSearch_1 = require("./elasticSearch");
const constants_1 = require("./constants");
const searchInclusions_1 = require("./searchInclusions");
const FHIRSearchParametersRegistry_1 = require("./FHIRSearchParametersRegistry");
const QueryBuilder_1 = require("./QueryBuilder");
const FhirQueryParser_1 = require("./FhirQueryParser");
const chain_1 = __importDefault(require("./QueryBuilder/chain"));
const loggerBuilder_1 = __importDefault(require("./loggerBuilder"));
const logger = (0, loggerBuilder_1.default)();
const MAX_INCLUDE_ITERATIVE_DEPTH = 5;
const getAliasName = (resourceType, tenantId) => {
    const lowercaseResourceType = resourceType.toLowerCase();
    if (tenantId) {
        return `${lowercaseResourceType}-alias-tenant-${tenantId}`;
    }
    return `${lowercaseResourceType}-alias`;
};
// eslint-disable-next-line import/prefer-default-export
class ElasticSearchService {
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
    constructor(searchFiltersForAllQueries = [], cleanUpFunction = function passThrough(resource) {
        return resource;
    }, fhirVersion = '4.0.1', compiledImplementationGuides, esClient = elasticSearch_1.ElasticSearch, { enableMultiTenancy = false, useKeywordSubFields = true, } = {}) {
        this.searchFiltersForAllQueries = searchFiltersForAllQueries;
        this.cleanUpFunction = cleanUpFunction;
        this.fhirVersion = fhirVersion;
        this.fhirSearchParametersRegistry = new FHIRSearchParametersRegistry_1.FHIRSearchParametersRegistry(fhirVersion, compiledImplementationGuides);
        this.esClient = esClient;
        this.useKeywordSubFields = useKeywordSubFields;
        this.enableMultiTenancy = enableMultiTenancy;
    }
    assertValidTenancyMode(tenantId) {
        if (this.enableMultiTenancy && tenantId === undefined) {
            throw new Error('This instance has multi-tenancy enabled, but the incoming request is missing tenantId');
        }
        if (!this.enableMultiTenancy && tenantId !== undefined) {
            throw new Error('This instance has multi-tenancy disabled, but the incoming request has a tenantId');
        }
    }
    async getCapabilities() {
        return this.fhirSearchParametersRegistry.getCapabilities();
    }
    getFilters(request) {
        const { searchFilters, tenantId } = request;
        const filters = ElasticSearchService.buildElasticSearchFilter([
            ...this.searchFiltersForAllQueries,
            ...(searchFilters !== null && searchFilters !== void 0 ? searchFilters : []),
        ]);
        if (this.enableMultiTenancy) {
            filters.push({
                match: {
                    _tenantId: tenantId,
                },
            });
        }
        return filters;
    }
    /*
    searchParams => {field: value}
     */
    async typeSearch(request) {
        this.assertValidTenancyMode(request.tenantId);
        const { queryParams, resourceType } = request;
        try {
            const from = queryParams["_getpagesoffset" /* SEARCH_PAGINATION_PARAMS.PAGES_OFFSET */]
                ? Number(queryParams["_getpagesoffset" /* SEARCH_PAGINATION_PARAMS.PAGES_OFFSET */])
                : 0;
            const size = queryParams["_count" /* SEARCH_PAGINATION_PARAMS.COUNT */]
                ? Number(queryParams["_count" /* SEARCH_PAGINATION_PARAMS.COUNT */])
                : constants_1.DEFAULT_SEARCH_RESULTS_PER_PAGE;
            if (from + size > constants_1.MAX_ES_WINDOW_SIZE) {
                logger.error(`Search request is out of bound. Trying to access ${from} to ${from + size} which is outside of the max: ${constants_1.MAX_ES_WINDOW_SIZE}`);
                throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError(`Search parameters: ${"_getpagesoffset" /* SEARCH_PAGINATION_PARAMS.PAGES_OFFSET */} and ${"_count" /* SEARCH_PAGINATION_PARAMS.COUNT */} are accessing items outside the max range (${constants_1.MAX_ES_WINDOW_SIZE}). Please narrow your search to access the remaining items`);
            }
            const filter = this.getFilters(request);
            const parsedChainParameters = (0, chain_1.default)(this.fhirSearchParametersRegistry, request.resourceType, request.queryParams);
            let chainedParameterQuery;
            if (parsedChainParameters.length > 0) {
                chainedParameterQuery = await this.getChainedParametersQuery(parsedChainParameters, request, filter);
                if ((0, lodash_1.isEmpty)(chainedParameterQuery)) {
                    // chained parameter query did not return any results
                    return {
                        result: {
                            numberOfResults: 0,
                            entries: [],
                            message: '',
                        },
                    };
                }
            }
            const parsedFhirQueryParams = (0, FhirQueryParser_1.parseQuery)(this.fhirSearchParametersRegistry, request.resourceType, request.queryParams);
            const query = (0, QueryBuilder_1.buildQueryForAllSearchParameters)(this.fhirSearchParametersRegistry, request, parsedFhirQueryParams.searchParams, this.useKeywordSubFields, filter, chainedParameterQuery);
            const params = {
                resourceType,
                queryRequest: {
                    from,
                    size,
                    track_total_hits: true,
                    body: {
                        query,
                    },
                },
            };
            if (request.queryParams[constants_1.SORT_PARAMETER]) {
                params.queryRequest.body.sort = (0, QueryBuilder_1.buildSortClause)(this.fhirSearchParametersRegistry, resourceType, request.queryParams[constants_1.SORT_PARAMETER]);
            }
            const { total, hits } = await this.executeQuery(params, request);
            const result = {
                numberOfResults: total,
                entries: this.hitsToSearchEntries({ hits, baseUrl: request.baseUrl, mode: 'match' }),
                message: '',
            };
            if (from !== 0) {
                result.previousResultUrl = this.createURL(request.baseUrl, {
                    ...queryParams,
                    ["_getpagesoffset" /* SEARCH_PAGINATION_PARAMS.PAGES_OFFSET */]: from - size,
                    ["_count" /* SEARCH_PAGINATION_PARAMS.COUNT */]: size,
                }, resourceType);
            }
            if (from + size < total) {
                result.nextResultUrl = this.createURL(request.baseUrl, {
                    ...queryParams,
                    ["_getpagesoffset" /* SEARCH_PAGINATION_PARAMS.PAGES_OFFSET */]: from + size,
                    ["_count" /* SEARCH_PAGINATION_PARAMS.COUNT */]: size,
                }, resourceType);
            }
            if (parsedFhirQueryParams.inclusionSearchParams) {
                const includedResources = await this.processSearchInclusions(result.entries, request, parsedFhirQueryParams.inclusionSearchParams);
                result.entries.push(...includedResources);
                const iterativelyIncludedResources = await this.processIterativeSearchInclusions(result.entries, request, parsedFhirQueryParams.inclusionSearchParams);
                result.entries.push(...iterativelyIncludedResources);
            }
            return { result };
        }
        catch (error) {
            logger.error(error);
            throw error;
        }
    }
    // Return translated chained parameters that can be used as normal search parameters
    // eslint-disable-next-line class-methods-use-this
    async getChainedParametersQuery(parsedChainParameters, request, filters = []) {
        let combinedChainedParameters = {};
        // eslint-disable-next-line no-restricted-syntax
        for (const { chain, initialValue } of parsedChainParameters) {
            let stepValue = initialValue;
            let chainComplete = true;
            const lastChain = chain.pop();
            // eslint-disable-next-line no-restricted-syntax
            for (const { resourceType, searchParam } of chain) {
                const stepRequest = {
                    ...request,
                    resourceType,
                    queryParams: { [searchParam]: stepValue },
                };
                const parsedFhirQueryParams = (0, FhirQueryParser_1.parseQuery)(this.fhirSearchParametersRegistry, stepRequest.resourceType, stepRequest.queryParams);
                const stepQuery = (0, QueryBuilder_1.buildQueryForAllSearchParameters)(this.fhirSearchParametersRegistry, stepRequest, parsedFhirQueryParams.searchParams, this.useKeywordSubFields, filters);
                const params = {
                    resourceType,
                    queryRequest: {
                        size: constants_1.MAX_CHAINED_PARAMS_RESULT,
                        track_total_hits: true,
                        body: {
                            query: stepQuery,
                            fields: ['id'],
                            _source: false,
                        },
                    },
                };
                // eslint-disable-next-line no-await-in-loop
                const { total, hits } = await this.executeQuery(params, request);
                if (total === 0) {
                    chainComplete = false;
                    break;
                }
                if (total > constants_1.MAX_CHAINED_PARAMS_RESULT) {
                    throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError(`Chained parameter ${searchParam} result in more than ${constants_1.MAX_CHAINED_PARAMS_RESULT} ${resourceType} resource. Please provide more precise queries.`);
                }
                stepValue = hits.map((hit) => `${resourceType}/${hit.fields.id[0]}`);
            }
            if (chainComplete) {
                combinedChainedParameters = (0, lodash_1.merge)(combinedChainedParameters, { [lastChain.searchParam]: stepValue });
            }
        }
        return combinedChainedParameters;
    }
    // eslint-disable-next-line class-methods-use-this
    async executeQuery(searchQuery, request) {
        try {
            const searchQueryWithAlias = {
                ...searchQuery.queryRequest,
                index: getAliasName(searchQuery.resourceType, request.tenantId),
                ...(request.sessionId && { preference: request.sessionId }),
            };
            if (logger.isDebugEnabled()) {
                logger.debug(`Elastic search query: ${JSON.stringify(searchQueryWithAlias, null, 2)}`);
            }
            const apiResponse = await this.esClient.search(searchQueryWithAlias);
            return {
                total: apiResponse.body.hits.total.value,
                hits: apiResponse.body.hits.hits,
            };
        }
        catch (error) {
            // Indexes are created the first time a resource of a given type is written to DDB.
            if (error instanceof errors_1.ResponseError && error.meta.body.error.type === 'index_not_found_exception') {
                logger.error(`Search index for ${getAliasName(searchQuery.resourceType, request.tenantId)} does not exist. Returning an empty search result`);
                return {
                    total: 0,
                    hits: [],
                };
            }
            throw error;
        }
    }
    // eslint-disable-next-line class-methods-use-this
    async executeQueries(searchQueries, request) {
        if (searchQueries.length === 0) {
            return {
                hits: [],
            };
        }
        const searchQueriesWithAlias = searchQueries.map((searchQuery) => ({
            ...searchQuery.queryRequest,
            index: getAliasName(searchQuery.resourceType, request.tenantId),
        }));
        if (logger.isDebugEnabled()) {
            logger.debug(`Elastic msearch query: ${JSON.stringify(searchQueriesWithAlias, null, 2)}`);
        }
        const apiResponse = await this.esClient.msearch({
            body: searchQueriesWithAlias.flatMap((query) => [
                { index: query.index, ...(request.sessionId && { preference: request.sessionId }) },
                { size: query.size, query: query.body.query },
            ]),
        });
        return apiResponse.body.responses
            .filter((response) => {
            if (response.error) {
                if (response.error.type === 'index_not_found_exception') {
                    // Indexes are created the first time a resource of a given type is written to DDB.
                    logger.error(`Search index for ${response.error.index} does not exist. Returning an empty search result`);
                    return false;
                }
                throw response.error;
            }
            return true;
        })
            .reduce((acc, response) => {
            acc.hits.push(...response.hits.hits);
            return acc;
        }, {
            hits: [],
        });
    }
    hitsToSearchEntries({ hits, baseUrl, mode = 'match', }) {
        return hits.map((hit) => {
            // Modify to return resource with FHIR id not Dynamo ID
            const resource = this.cleanUpFunction(hit._source);
            return {
                search: {
                    mode,
                },
                fullUrl: url_1.default.format({
                    host: baseUrl,
                    pathname: `/${resource.resourceType}/${resource.id}`,
                }),
                resource,
            };
        });
    }
    async processSearchInclusions(searchEntries, request, inclusionSearchParameters, iterative) {
        const { allowedResourceTypes, baseUrl } = request;
        const filter = this.getFilters(request);
        const includeSearchQueries = (0, searchInclusions_1.buildIncludeQueries)(inclusionSearchParameters, searchEntries.map((x) => x.resource), filter, this.fhirSearchParametersRegistry, iterative);
        const revIncludeSearchQueries = (0, searchInclusions_1.buildRevIncludeQueries)(inclusionSearchParameters, searchEntries.map((x) => x.resource), filter, this.fhirSearchParametersRegistry, this.useKeywordSubFields, iterative);
        const lowerCaseAllowedResourceTypes = new Set(allowedResourceTypes.map((r) => r.toLowerCase()));
        const allowedInclusionQueries = [...includeSearchQueries, ...revIncludeSearchQueries].filter((query) => lowerCaseAllowedResourceTypes.has(query.resourceType.toLowerCase()));
        const { hits } = await this.executeQueries(allowedInclusionQueries, request);
        return this.hitsToSearchEntries({ hits, baseUrl, mode: 'include' });
    }
    async processIterativeSearchInclusions(searchEntries, request, inclusionSearchParams) {
        if (!constants_1.ITERATIVE_INCLUSION_PARAMETERS.some((param) => request.queryParams[param])) {
            return [];
        }
        const result = [];
        const resourceIdsAlreadyInResult = new Set(searchEntries.map((searchEntry) => searchEntry.resource.id));
        const resourceIdsWithInclusionsAlreadyResolved = new Set();
        logger.error('Iterative inclusion search starts');
        let resourcesToIterate = searchEntries;
        for (let i = 0; i < MAX_INCLUDE_ITERATIVE_DEPTH; i += 1) {
            // eslint-disable-next-line no-await-in-loop
            const resourcesFound = await this.processSearchInclusions(resourcesToIterate, request, inclusionSearchParams, true);
            resourcesToIterate.forEach((resource) => resourceIdsWithInclusionsAlreadyResolved.add(resource.resource.id));
            if (resourcesFound.length === 0) {
                logger.error(`Iteration ${i} found zero results. Stopping`);
                break;
            }
            resourcesFound.forEach((resourceFound) => {
                // Avoid duplicates in result. In some cases different include/revinclude clauses can end up finding the same resource.
                if (!resourceIdsAlreadyInResult.has(resourceFound.resource.id)) {
                    resourceIdsAlreadyInResult.add(resourceFound.resource.id);
                    result.push(resourceFound);
                }
            });
            if (i === MAX_INCLUDE_ITERATIVE_DEPTH - 1) {
                logger.error('MAX_INCLUDE_ITERATIVE_DEPTH reached. Stopping');
                break;
            }
            resourcesToIterate = resourcesFound.filter((r) => !resourceIdsWithInclusionsAlreadyResolved.has(r.resource.id));
            logger.error(`Iteration ${i} found ${resourcesFound.length} resources`);
        }
        return result;
    }
    // eslint-disable-next-line class-methods-use-this
    createURL(host, query, resourceType) {
        return url_1.default.format({
            host,
            pathname: `/${resourceType}`,
            query,
        });
    }
    // eslint-disable-next-line class-methods-use-this
    async globalSearch(request) {
        logger.error(request);
        this.assertValidTenancyMode(request.tenantId);
        throw new Error('Method not implemented.');
    }
    validateSubscriptionSearchCriteria(searchCriteria) {
        const { inclusionSearchParams, chainedSearchParams, otherParams } = (0, FhirQueryParser_1.parseQueryString)(this.fhirSearchParametersRegistry, searchCriteria);
        if (inclusionSearchParams || chainedSearchParams || otherParams) {
            throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError('Search string used for field criteria contains unsupported parameter, please remove: ' +
                '_revinclude, _include, _sort, _count and chained parameters');
        }
    }
    static buildSingleElasticSearchFilterPart(key, value, operator) {
        switch (operator) {
            case '==': {
                return {
                    match: {
                        [key]: value,
                    },
                };
            }
            case '!=': {
                return {
                    bool: {
                        must_not: [
                            {
                                term: {
                                    [key]: value,
                                },
                            },
                        ],
                    },
                };
            }
            case '>': {
                return {
                    range: {
                        [key]: {
                            gt: value,
                        },
                    },
                };
            }
            case '<': {
                return {
                    range: {
                        [key]: {
                            lt: value,
                        },
                    },
                };
            }
            case '>=': {
                return {
                    range: {
                        [key]: {
                            gte: value,
                        },
                    },
                };
            }
            case '<=': {
                return {
                    range: {
                        [key]: {
                            lte: value,
                        },
                    },
                };
            }
            default: {
                throw new Error('Unknown comparison operator');
            }
        }
    }
    static buildElasticSearchFilterPart(searchFilter) {
        const { key, value, comparisonOperator, logicalOperator } = searchFilter;
        if (value.length === 0) {
            throw new Error('Malformed SearchFilter, at least 1 value is required for the comparison');
        }
        const parts = value.map((v) => ElasticSearchService.buildSingleElasticSearchFilterPart(key, v, comparisonOperator));
        if (logicalOperator === 'AND' && parts.length > 1) {
            return {
                bool: {
                    should: parts,
                },
            };
        }
        return parts;
    }
    /**
     * ES filter is created where all 'AND' filters are required and at least 1 'OR' condition is met
     * @returns the `filter` part of the ES query
     */
    static buildElasticSearchFilter(searchFilters) {
        const partitions = (0, lodash_1.partition)(searchFilters, (filter) => filter.logicalOperator === 'OR');
        const orSearchFilterParts = partitions[0].map(ElasticSearchService.buildElasticSearchFilterPart).flat();
        const andSearchFilterParts = partitions[1].map(ElasticSearchService.buildElasticSearchFilterPart).flat();
        let filterQuery = [];
        if (andSearchFilterParts.length > 0) {
            filterQuery = andSearchFilterParts;
        }
        if (orSearchFilterParts.length > 0) {
            filterQuery.push({
                bool: {
                    should: orSearchFilterParts,
                },
            });
        }
        return filterQuery;
    }
}
exports.ElasticSearchService = ElasticSearchService;
//# sourceMappingURL=elasticSearchService.js.map