"use strict";
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSortClause = exports.buildQueryForAllSearchParameters = void 0;
const lodash_1 = require("lodash");
const stringQuery_1 = require("./typeQueries/stringQuery");
const dateQuery_1 = require("./typeQueries/dateQuery");
const tokenQuery_1 = require("./typeQueries/tokenQuery");
const numberQuery_1 = require("./typeQueries/numberQuery");
const quantityQuery_1 = require("./typeQueries/quantityQuery");
const referenceQuery_1 = require("./typeQueries/referenceQuery");
const uriQuery_1 = require("./typeQueries/uriQuery");
const FhirQueryParser_1 = require("../FhirQueryParser");
function typeQueryWithConditions(searchParam, compiledSearchParam, searchValue, useKeywordSubFields, baseUrl, modifier) {
    let typeQuery;
    switch (searchParam.type) {
        case 'string':
            typeQuery = (0, stringQuery_1.stringQuery)(compiledSearchParam, searchValue, modifier);
            break;
        case 'date':
            typeQuery = (0, dateQuery_1.dateQuery)(compiledSearchParam, searchValue, modifier);
            break;
        case 'token':
            typeQuery = (0, tokenQuery_1.tokenQuery)(compiledSearchParam, searchValue, useKeywordSubFields, modifier);
            break;
        case 'number':
            typeQuery = (0, numberQuery_1.numberQuery)(compiledSearchParam, searchValue, modifier);
            break;
        case 'quantity':
            typeQuery = (0, quantityQuery_1.quantityQuery)(compiledSearchParam, searchValue, useKeywordSubFields, modifier);
            break;
        case 'reference':
            typeQuery = (0, referenceQuery_1.referenceQuery)(compiledSearchParam, searchValue, useKeywordSubFields, baseUrl, searchParam.name, searchParam.target, modifier);
            break;
        case 'uri':
            typeQuery = (0, uriQuery_1.uriQuery)(compiledSearchParam, searchValue, useKeywordSubFields, modifier);
            break;
        case 'composite':
        case 'special':
        default:
            typeQuery = (0, stringQuery_1.stringQuery)(compiledSearchParam, searchValue, modifier);
    }
    // In most cases conditions are used for fields that are an array of objects
    // Ideally we should be using a nested query, but that'd require to update the index mappings.
    //
    // Simply using an array of bool.must is good enough for most cases. The result will contain the correct documents, however it MAY contain additional documents
    // https://www.elastic.co/guide/en/elasticsearch/reference/current/nested.html
    if (compiledSearchParam.condition !== undefined) {
        return {
            bool: {
                must: [
                    typeQuery,
                    {
                        multi_match: {
                            fields: [compiledSearchParam.condition[0], `${compiledSearchParam.condition[0]}.*`],
                            query: compiledSearchParam.condition[2],
                            lenient: true,
                        },
                    },
                ],
            },
        };
    }
    return typeQuery;
}
function searchParamQuery(searchParam, splitSearchValue, useKeywordSubFields, baseUrl, modifier) {
    // const splitSearchValue = getOrSearchValues(searchValue);
    let queryList = [];
    for (let i = 0; i < splitSearchValue.length; i += 1) {
        queryList.push(searchParam.compiled.map((compiled) => typeQueryWithConditions(searchParam, compiled, splitSearchValue[i], useKeywordSubFields, baseUrl, modifier)));
    }
    // flatten array of arrays of results into one array with results
    queryList = queryList.flat(1);
    if (queryList.length === 1) {
        return queryList[0];
    }
    return {
        bool: {
            should: queryList,
        },
    };
}
// eslint-disable-next-line import/prefer-default-export
const buildQueryForAllSearchParameters = (fhirSearchParametersRegistry, request, searchParams, useKeywordSubFields, additionalFilters = [], chainedParameterQuery = {}) => {
    const esQuery = searchParams.map((queryParam) => {
        return searchParamQuery(queryParam.searchParam, queryParam.parsedSearchValues, useKeywordSubFields, request.baseUrl, queryParam.modifier);
    });
    if (!(0, lodash_1.isEmpty)(chainedParameterQuery)) {
        const parsedFhirQueryForChainedParams = (0, FhirQueryParser_1.parseQuery)(fhirSearchParametersRegistry, request.resourceType, chainedParameterQuery);
        const ESChainedParamQuery = parsedFhirQueryForChainedParams.searchParams.map((queryParam) => {
            return searchParamQuery(queryParam.searchParam, queryParam.parsedSearchValues, useKeywordSubFields, request.baseUrl, queryParam.modifier);
        });
        esQuery.push({
            bool: {
                should: ESChainedParamQuery,
            },
        });
    }
    return {
        bool: {
            filter: additionalFilters,
            must: esQuery,
        },
    };
};
exports.buildQueryForAllSearchParameters = buildQueryForAllSearchParameters;
var sort_1 = require("./sort");
Object.defineProperty(exports, "buildSortClause", { enumerable: true, get: function () { return sort_1.buildSortClause; } });
//# sourceMappingURL=index.js.map