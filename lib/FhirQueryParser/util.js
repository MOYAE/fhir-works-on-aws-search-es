"use strict";
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isChainedParameter = exports.normalizeQueryParams = exports.parseSearchModifiers = void 0;
const fhir_works_on_aws_interface_1 = require("fhir-works-on-aws-interface");
const parseSearchModifiers = (searchParameter) => {
    const modifier = searchParameter.split(':');
    // split was unsuccessful, there is no modifier
    if (modifier.length === 1) {
        return { parameterName: modifier[0], modifier: undefined };
    }
    return { parameterName: modifier[0], modifier: modifier[1] };
};
exports.parseSearchModifiers = parseSearchModifiers;
const normalizeQueryParams = (queryParams) => {
    const normalizedQueryParams = {};
    Object.entries(queryParams).forEach(([searchParameter, searchValue]) => {
        if (typeof searchValue === 'string') {
            normalizedQueryParams[searchParameter] = [searchValue];
            return;
        }
        if (Array.isArray(searchValue) && searchValue.every((s) => typeof s === 'string')) {
            normalizedQueryParams[searchParameter] = searchValue;
            return;
        }
        // This may occur if the router has advanced querystring parsing enabled
        // e.g. {{API_URL}}/Patient?name[key]=Smith may be parsed into {"name":{"key":"Smith"}}
        throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError(`Invalid search parameter: '${searchParameter}'`);
    });
    return normalizedQueryParams;
};
exports.normalizeQueryParams = normalizeQueryParams;
const isChainedParameter = (parameterKey) => {
    const regex = new RegExp('[A-Za-z][.][A-Za-z]');
    return regex.test(parameterKey);
};
exports.isChainedParameter = isChainedParameter;
//# sourceMappingURL=util.js.map