"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRevIncludeQueries = exports.buildIncludeQueries = exports.buildRevIncludeQuery = exports.buildIncludeQuery = exports.getRevincludeReferencesFromResources = exports.getIncludeReferencesFromResources = void 0;
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const lodash_1 = require("lodash");
const getAllValuesForFHIRPath_1 = require("./getAllValuesForFHIRPath");
const constants_1 = require("./constants");
const expandRevIncludeWildcard = (resourceTypes, fhirSearchParametersRegistry) => {
    return resourceTypes.flatMap((resourceType) => {
        return fhirSearchParametersRegistry.getRevIncludeSearchParameters(resourceType).flatMap((searchParam) => {
            return searchParam.target.map((target) => ({
                type: '_revinclude',
                isWildcard: false,
                sourceResource: searchParam.base,
                searchParameter: searchParam.name,
                path: searchParam.compiled[0].path,
                targetResourceType: target,
            }));
        });
    });
};
const expandIncludeWildcard = (resourceTypes, fhirSearchParametersRegistry) => {
    return resourceTypes.flatMap((resourceType) => {
        return fhirSearchParametersRegistry.getIncludeSearchParameters(resourceType).flatMap((searchParam) => {
            return searchParam.target.map((target) => ({
                type: '_include',
                isWildcard: false,
                sourceResource: searchParam.base,
                searchParameter: searchParam.name,
                path: searchParam.compiled[0].path,
                targetResourceType: target,
            }));
        });
    });
};
const RELATIVE_URL_REGEX = /^[A-Za-z]+\/[A-Za-z0-9-]+$/;
const getIncludeReferencesFromResources = (includes, resources) => {
    const references = includes.flatMap((include) => {
        return resources
            .filter((resource) => resource.resourceType === include.sourceResource)
            .flatMap((resource) => (0, getAllValuesForFHIRPath_1.getAllValuesForFHIRPath)(resource, `${include.path}`))
            .flatMap((valueAtPath) => {
            if (Array.isArray(valueAtPath)) {
                return valueAtPath.map((v) => (0, lodash_1.get)(v, 'reference'));
            }
            return [(0, lodash_1.get)(valueAtPath, 'reference')];
        })
            .filter((reference) => typeof reference === 'string')
            .filter((reference) => RELATIVE_URL_REGEX.test(reference))
            .map((relativeUrl) => {
            const [resourceType, id] = relativeUrl.split('/');
            return { resourceType, id };
        })
            .filter(({ resourceType }) => !include.targetResourceType || include.targetResourceType === resourceType);
    });
    return (0, lodash_1.uniqBy)(references, (x) => `${x.resourceType}/${x.id}`);
};
exports.getIncludeReferencesFromResources = getIncludeReferencesFromResources;
const getRevincludeReferencesFromResources = (revIncludeParameters, resources) => {
    return revIncludeParameters
        .map((revinclude) => {
        const references = resources
            .filter((resource) => revinclude.targetResourceType === undefined ||
            resource.resourceType === revinclude.targetResourceType)
            .map((resource) => `${resource.resourceType}/${resource.id}`);
        return { revinclude, references };
    })
        .filter(({ references }) => references.length > 0);
};
exports.getRevincludeReferencesFromResources = getRevincludeReferencesFromResources;
const buildIncludeQuery = (resourceType, resourceIds, filterRulesForActiveResources) => ({
    resourceType,
    queryRequest: {
        size: constants_1.MAX_INCLUSION_PARAM_RESULTS,
        body: {
            query: {
                bool: {
                    filter: [
                        {
                            terms: {
                                id: resourceIds,
                            },
                        },
                        ...filterRulesForActiveResources,
                    ],
                },
            },
        },
    },
});
exports.buildIncludeQuery = buildIncludeQuery;
const buildRevIncludeQuery = (revIncludeSearchParameter, references, filterRulesForActiveResources, useKeywordSubFields) => {
    const keywordSuffix = useKeywordSubFields ? '.keyword' : '';
    const { sourceResource, path } = revIncludeSearchParameter;
    return {
        resourceType: sourceResource,
        queryRequest: {
            size: constants_1.MAX_INCLUSION_PARAM_RESULTS,
            body: {
                query: {
                    bool: {
                        filter: [
                            {
                                terms: {
                                    [`${path}.reference${keywordSuffix}`]: references,
                                },
                            },
                            ...filterRulesForActiveResources,
                        ],
                    },
                },
            },
        },
    };
};
exports.buildRevIncludeQuery = buildRevIncludeQuery;
const buildIncludeQueries = (inclusionSearchParameters, resources, filterRulesForActiveResources, fhirSearchParametersRegistry, iterate) => {
    const allIncludeParameters = inclusionSearchParameters.filter((param) => param.type === '_include' && param.isIterate === iterate);
    const includeParameters = allIncludeParameters.some((x) => x.isWildcard)
        ? expandIncludeWildcard([
            ...resources.reduce((acc, resource) => acc.add(resource.resourceType), new Set()),
        ], fhirSearchParametersRegistry)
        : allIncludeParameters;
    const resourceReferences = (0, exports.getIncludeReferencesFromResources)(includeParameters, resources);
    const resourceTypeToIds = (0, lodash_1.mapValues)((0, lodash_1.groupBy)(resourceReferences, (resourcReference) => resourcReference.resourceType), (arr) => arr.map((x) => x.id));
    return Object.entries(resourceTypeToIds).map(([resourceType, ids]) => {
        return (0, exports.buildIncludeQuery)(resourceType, ids, filterRulesForActiveResources);
    });
};
exports.buildIncludeQueries = buildIncludeQueries;
const buildRevIncludeQueries = (inclusionSearchParameters, resources, filterRulesForActiveResources, fhirSearchParametersRegistry, useKeywordSubFields, iterate) => {
    const allRevincludeParameters = inclusionSearchParameters.filter((param) => param.type === '_revinclude' && param.isIterate === iterate);
    const revIncludeParameters = allRevincludeParameters.some((x) => x.isWildcard)
        ? expandRevIncludeWildcard([
            ...resources.reduce((acc, resource) => acc.add(resource.resourceType), new Set()),
        ], fhirSearchParametersRegistry)
        : allRevincludeParameters;
    const revincludeReferences = (0, exports.getRevincludeReferencesFromResources)(revIncludeParameters, resources);
    return revincludeReferences.map(({ revinclude, references }) => (0, exports.buildRevIncludeQuery)(revinclude, references, filterRulesForActiveResources, useKeywordSubFields));
};
exports.buildRevIncludeQueries = buildRevIncludeQueries;
//# sourceMappingURL=searchInclusions.js.map