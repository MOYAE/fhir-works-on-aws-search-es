"use strict";
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchParsedFhirQueryParams = void 0;
const numberMatch_1 = require("./matchers/numberMatch");
const dateMatch_1 = require("./matchers/dateMatch");
const getAllValuesForFHIRPath_1 = require("../getAllValuesForFHIRPath");
const stringMatch_1 = require("./matchers/stringMatch");
const quantityMatch_1 = require("./matchers/quantityMatch");
const referenceMatcher_1 = require("./matchers/referenceMatcher");
const tokenMatch_1 = require("./matchers/tokenMatch");
const uriMatch_1 = require("./matchers/uriMatch");
const typeMatcher = (queryParam, compiledSearchParam, searchValue, resourceValue, { fhirServiceBaseUrl } = {}) => {
    const { searchParam, modifier } = queryParam;
    switch (searchParam.type) {
        case 'string':
            return (0, stringMatch_1.stringMatch)(compiledSearchParam, searchValue, resourceValue, modifier);
        case 'date':
            return (0, dateMatch_1.dateMatch)(searchValue, resourceValue);
        case 'number':
            return (0, numberMatch_1.numberMatch)(searchValue, resourceValue);
        case 'quantity':
            return (0, quantityMatch_1.quantityMatch)(searchValue, resourceValue);
        case 'reference':
            return (0, referenceMatcher_1.referenceMatch)(searchValue, resourceValue, {
                target: searchParam.target,
                fhirServiceBaseUrl,
            });
        case 'token':
            return (0, tokenMatch_1.tokenMatch)(searchValue, resourceValue);
        case 'composite':
            break;
        case 'special':
            break;
        case 'uri':
            return (0, uriMatch_1.uriMatch)(searchValue, resourceValue);
        default:
            // eslint-disable-next-line no-case-declarations
            const exhaustiveCheck = searchParam.type;
            return exhaustiveCheck;
    }
    return false;
};
function evaluateCompiledCondition(condition, resource) {
    if (condition === undefined) {
        return true;
    }
    const resourceValues = (0, getAllValuesForFHIRPath_1.getAllValuesForFHIRPath)(resource, condition[0]);
    if (condition[1] === '=') {
        return resourceValues.some((resourceValue) => resourceValue === condition[2]);
    }
    if (condition[1] === 'resolve') {
        const resourceType = condition[2];
        return resourceValues.some((resourceValue) => {
            const referenceField = resourceValue === null || resourceValue === void 0 ? void 0 : resourceValue.reference;
            return ((resourceValue === null || resourceValue === void 0 ? void 0 : resourceValue.type) === resourceType ||
                (typeof referenceField === 'string' && referenceField.startsWith(`${resourceType}/`)));
        });
    }
    return false;
}
function evaluateQueryParam(queryParam, resource, { fhirServiceBaseUrl } = {}) {
    return queryParam.parsedSearchValues.some((parsedSearchValue) => queryParam.searchParam.compiled.some((compiled) => evaluateCompiledCondition(compiled.condition, resource) &&
        (0, getAllValuesForFHIRPath_1.getAllValuesForFHIRPath)(resource, compiled.path).some((resourceValue) => typeMatcher(queryParam, compiled, parsedSearchValue, resourceValue, {
            fhirServiceBaseUrl,
        }))));
}
/**
 * checks if the given resource is matched by a FHIR search query
 * @param parsedFhirQueryParams - parsed FHIR search query
 * @param resource - FHIR resource to be matched
 * @param options.fhirServiceBaseUrl - URL of the FHIR served where the FHIR resource is located.
 * The URL is used to translate relative references into full URLs and vice versa
 */
// eslint-disable-next-line import/prefer-default-export
function matchParsedFhirQueryParams(parsedFhirQueryParams, resource, { fhirServiceBaseUrl } = {}) {
    if (parsedFhirQueryParams.resourceType !== (resource === null || resource === void 0 ? void 0 : resource.resourceType)) {
        return false;
    }
    return parsedFhirQueryParams.searchParams.every((queryParam) => evaluateQueryParam(queryParam, resource, { fhirServiceBaseUrl }));
}
exports.matchParsedFhirQueryParams = matchParsedFhirQueryParams;
//# sourceMappingURL=index.js.map