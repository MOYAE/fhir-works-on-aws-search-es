"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseQueryString = exports.parseQuery = void 0;
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
const lodash_1 = require("lodash");
const fhir_works_on_aws_interface_1 = require("fhir-works-on-aws-interface");
const qs = __importStar(require("qs"));
const util_1 = require("./util");
const loggerBuilder_1 = __importDefault(require("../loggerBuilder"));
const constants_1 = require("../constants");
const searchOR_1 = __importDefault(require("./searchOR"));
const dateParser_1 = require("./typeParsers/dateParser");
const tokenParser_1 = require("./typeParsers/tokenParser");
const numberParser_1 = require("./typeParsers/numberParser");
const quantityParser_1 = require("./typeParsers/quantityParser");
const referenceParser_1 = require("./typeParsers/referenceParser");
const searchInclusion_1 = require("./searchInclusion");
const parseStringLikeSearchValue = (rawSearchValue) => rawSearchValue;
const parseSearchQueryParam = (searchParam, rawSearchValue) => {
    const orSearchValues = (0, searchOR_1.default)(rawSearchValue);
    switch (searchParam.type) {
        case 'date':
            return {
                type: searchParam.type,
                name: searchParam.name,
                searchParam,
                parsedSearchValues: orSearchValues.map(dateParser_1.parseDateSearchValue),
            };
        case 'number':
            return {
                type: searchParam.type,
                name: searchParam.name,
                searchParam,
                parsedSearchValues: orSearchValues.map(numberParser_1.parseNumberSearchValue),
            };
        case 'quantity':
            return {
                type: searchParam.type,
                name: searchParam.name,
                searchParam,
                parsedSearchValues: orSearchValues.map(quantityParser_1.parseQuantitySearchValue),
            };
        case 'reference':
            return {
                type: searchParam.type,
                name: searchParam.name,
                searchParam,
                parsedSearchValues: orSearchValues.map((searchValue) => (0, referenceParser_1.parseReferenceSearchValue)(searchParam, searchValue)),
            };
        case 'string':
            return {
                type: searchParam.type,
                name: searchParam.name,
                searchParam,
                parsedSearchValues: orSearchValues.map(parseStringLikeSearchValue),
            };
        case 'composite':
            // composite is not supported at this time and we just treat them as string params
            return {
                type: searchParam.type,
                name: searchParam.name,
                searchParam,
                parsedSearchValues: orSearchValues.map(parseStringLikeSearchValue),
            };
        case 'special':
            // special is not supported at this time and we just treat them as string params
            return {
                type: searchParam.type,
                name: searchParam.name,
                searchParam,
                parsedSearchValues: orSearchValues.map(parseStringLikeSearchValue),
            };
        case 'token':
            return {
                type: searchParam.type,
                name: searchParam.name,
                searchParam,
                parsedSearchValues: orSearchValues.map(tokenParser_1.parseTokenSearchValue),
            };
        case 'uri':
            return {
                type: searchParam.type,
                name: searchParam.name,
                searchParam,
                parsedSearchValues: orSearchValues.map(parseStringLikeSearchValue),
            };
        default:
            // eslint-disable-next-line no-case-declarations
            const exhaustiveCheck = searchParam.type;
            return exhaustiveCheck;
    }
};
const validateModifiers = ({ type, modifier }) => {
    // There are other valid modifiers in the FHIR spec, but this validation only accepts the modifiers currently implemented in FWoA
    const SUPPORTED_MODIFIERS = ['exact', 'contains'];
    if (type === 'string' && modifier !== undefined && !SUPPORTED_MODIFIERS.includes(modifier)) {
        throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError(`Unsupported string search modifier: ${modifier}`);
    }
};
/**
 * Parse and validate the search query parameters. This method ignores _include, _revinclude, _sort, and chained parameters
 * @param fhirSearchParametersRegistry - instance of FHIRSearchParametersRegistry
 * @param resourceType - FHIR resource type used as base in the search request
 * @param queryParams - search request query params object. It is expected to have the shape used by https://www.npmjs.com/package/qs
 */
const parseQuery = (fhirSearchParametersRegistry, resourceType, queryParams) => {
    const normalizedQueryParams = (0, util_1.normalizeQueryParams)(queryParams);
    const inclusionSearchParams = [];
    const chainedSearchParams = {};
    const otherParams = {};
    const searchableParams = Object.entries(normalizedQueryParams).filter(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ([searchParameter, value]) => {
        if ((0, util_1.isChainedParameter)(searchParameter)) {
            chainedSearchParams[searchParameter] = value;
            return false;
        }
        if (constants_1.INCLUSION_PARAMETERS.includes(searchParameter)) {
            inclusionSearchParams.push(...(0, searchInclusion_1.parseInclusionParams)(fhirSearchParametersRegistry, searchParameter, value));
            return false;
        }
        if (constants_1.UNSUPPORTED_GENERAL_PARAMETERS.includes(searchParameter)) {
            // since we don't support any of these at the moment, just log a message instead of ignoring and continue.
            (0, loggerBuilder_1.default)().info(`Search parameter ${searchParameter} is not currently supported.`);
            otherParams[searchParameter] = value;
            return false;
        }
        if (constants_1.NON_SEARCHABLE_PARAMETERS.includes(searchParameter)) {
            otherParams[searchParameter] = value;
            return false;
        }
        return true;
    });
    const parsedParams = searchableParams.flatMap(([searchParameter, searchValues]) => {
        const searchModifier = (0, util_1.parseSearchModifiers)(searchParameter);
        const fhirSearchParam = fhirSearchParametersRegistry.getSearchParameter(resourceType, searchModifier.parameterName);
        if (fhirSearchParam === undefined) {
            throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError(`Invalid search parameter '${searchModifier.parameterName}' for resource type ${resourceType}`);
        }
        return searchValues.map((searchValue) => {
            const parsedQueryParam = parseSearchQueryParam(fhirSearchParam, searchValue);
            parsedQueryParam.modifier = searchModifier.modifier;
            validateModifiers(parsedQueryParam);
            return parsedQueryParam;
        });
    });
    return {
        resourceType,
        searchParams: parsedParams,
        ...(!(0, lodash_1.isEmpty)(inclusionSearchParams) && { inclusionSearchParams }),
        ...(!(0, lodash_1.isEmpty)(chainedSearchParams) && { chainedSearchParams }),
        ...(!(0, lodash_1.isEmpty)(otherParams) && { otherParams }),
    };
};
exports.parseQuery = parseQuery;
/**
 * Parse and validate the search query parameters.
 * @param fhirSearchParametersRegistry - instance of FHIRSearchParametersRegistry
 * @param searchCriteria - Search criteria without the base url. Example: "Observation?code=http://loinc.org|1975-2"
 */
const parseQueryString = (fhirSearchParametersRegistry, searchCriteria) => {
    const questionMarkIndex = searchCriteria.indexOf('?') === -1 ? searchCriteria.length : searchCriteria.indexOf('?');
    const resourceType = searchCriteria.substring(0, questionMarkIndex);
    const queryString = searchCriteria.substring(questionMarkIndex + 1);
    return (0, exports.parseQuery)(fhirSearchParametersRegistry, resourceType, qs.parse(queryString));
};
exports.parseQueryString = parseQueryString;
//# sourceMappingURL=index.js.map