"use strict";
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyPrefixRulesToRange = exports.compareRanges = exports.compareNumberToRange = void 0;
const compareNumberToRange = (prefix, searchParamRange, resourceValue) => {
    const { start, end } = searchParamRange;
    // See https://www.hl7.org/fhir/search.html#prefix
    switch (prefix) {
        case 'ne': // not equal
            return resourceValue < start || resourceValue > end;
        case 'eq': // equal
            return resourceValue >= start && resourceValue <= end;
        case 'lt': // less than
            return resourceValue < end;
        case 'le': // less or equal
            return resourceValue <= end;
        case 'gt': // greater than
            return resourceValue > start;
        case 'ge': // greater or equal
            return resourceValue >= start;
        case 'sa': // starts after
            return resourceValue > end;
        case 'eb': // ends before
            return resourceValue < start;
        case 'ap': // approximately
            // same as eq for now
            return resourceValue >= start && resourceValue <= end;
        default:
            // this should never happen
            throw new Error(`unknown search prefix: ${prefix}`);
    }
};
exports.compareNumberToRange = compareNumberToRange;
// See the interpretation of prefixes when applied to ranges: https://www.hl7.org/fhir/search.html#prefix. It can be counterintuitive at first
const compareRanges = (prefix, searchParamRange, resourceRange) => {
    const { start, end } = searchParamRange;
    const resourceStart = resourceRange.start;
    const resourceEnd = resourceRange.end;
    // See https://www.hl7.org/fhir/search.html#prefix
    switch (prefix) {
        case 'ne': // not equal
            return !(resourceStart >= start && resourceEnd <= end);
        case 'eq': // equal
            return resourceStart >= start && resourceEnd <= end;
        case 'lt': // less than
        case 'le': // less or equal
            return resourceStart <= end;
        case 'gt': // greater than
        case 'ge': // greater or equal
            return resourceEnd >= start;
        case 'sa': // starts after
            return resourceStart > end;
        case 'eb': // ends before
            return resourceEnd < start;
        case 'ap': // approximately
            return !(resourceStart > end) && !(resourceEnd < start);
        default:
            // this should never happen
            throw new Error(`unknown search prefix: ${prefix}`);
    }
};
exports.compareRanges = compareRanges;
/**
 * When a comparison prefix in the set lgt, lt, ge, le, sa & eb is provided, the implicit precision of the number is ignored,
 * and they are treated as if they have arbitrarily high precision. https://www.hl7.org/fhir/search.html#number
 * @param prefix
 * @param number
 * @param range
 */
const applyPrefixRulesToRange = (prefix, number, range) => {
    if (prefix === 'eq' || prefix === 'ne') {
        return range;
    }
    return { start: number, end: number };
};
exports.applyPrefixRulesToRange = applyPrefixRulesToRange;
//# sourceMappingURL=numericComparison.js.map