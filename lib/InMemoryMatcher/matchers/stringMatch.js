"use strict";
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringMatch = void 0;
const getAllValuesForFHIRPath_1 = require("../../getAllValuesForFHIRPath");
const comparisons = {
    eq: (a, b) => typeof a === 'string' && a.split(/[ \-,.]/).includes(b),
    exact: (a, b) => a === b,
    contains: (a, b) => typeof a === 'string' && a.includes(b),
};
function isUsableType(x) {
    return x !== null && (typeof x === 'string' || typeof x === 'object');
}
// eslint-disable-next-line import/prefer-default-export
const stringMatch = (compiledSearchParam, value, resourceValue, modifier) => {
    if (!isUsableType(resourceValue)) {
        return false;
    }
    let op;
    switch (modifier) {
        case 'exact':
            op = comparisons.exact;
            break;
        case 'contains':
            op = comparisons.contains;
            break;
        case undefined:
            op = comparisons.eq;
            break;
        default:
            throw new Error(`The modifier ":${modifier}" is not supported`);
    }
    let valuesFromResource = [];
    if (typeof resourceValue === 'string') {
        valuesFromResource = [resourceValue];
    }
    else {
        let fieldsToMatch = [];
        if (compiledSearchParam.path === 'name') {
            // name is a special parameter.
            fieldsToMatch = ['family', 'given', 'text', 'prefix', 'suffix'];
        }
        if (compiledSearchParam.path === 'address') {
            // address is a special parameter.
            fieldsToMatch = ['city', 'country', 'district', 'line', 'postalCode', 'state', 'text'];
        }
        valuesFromResource = fieldsToMatch.flatMap((field) => (0, getAllValuesForFHIRPath_1.getAllValuesForFHIRPath)(resourceValue, field));
    }
    return valuesFromResource.some((f) => op(f, value));
};
exports.stringMatch = stringMatch;
//# sourceMappingURL=stringMatch.js.map