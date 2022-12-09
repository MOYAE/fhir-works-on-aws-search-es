"use strict";
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.quantityQuery = void 0;
const lodash_1 = require("lodash");
const fhir_works_on_aws_interface_1 = require("fhir-works-on-aws-interface");
const prefixRange_1 = require("./common/prefixRange");
const SUPPORTED_MODIFIERS = [];
// eslint-disable-next-line import/prefer-default-export
const quantityQuery = (compiledSearchParam, value, useKeywordSubFields, modifier) => {
    if (modifier && !SUPPORTED_MODIFIERS.includes(modifier)) {
        throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError(`Unsupported quantity search modifier: ${modifier}`);
    }
    const { prefix, implicitRange, number, system, code } = value;
    const queries = [(0, prefixRange_1.prefixRangeNumber)(prefix, number, implicitRange, `${compiledSearchParam.path}.value`)];
    const keywordSuffix = useKeywordSubFields ? '.keyword' : '';
    if (!(0, lodash_1.isEmpty)(system) && !(0, lodash_1.isEmpty)(code)) {
        queries.push({
            multi_match: {
                fields: [`${compiledSearchParam.path}.code${keywordSuffix}`],
                query: code,
                lenient: true,
            },
        });
        queries.push({
            multi_match: {
                fields: [`${compiledSearchParam.path}.system${keywordSuffix}`],
                query: system,
                lenient: true,
            },
        });
    }
    else if (!(0, lodash_1.isEmpty)(code)) {
        // when there is no system, search either the code (code) or the stated human unit (unit)
        // https://www.hl7.org/fhir/search.html#quantity
        queries.push({
            multi_match: {
                fields: [
                    `${compiledSearchParam.path}.code${keywordSuffix}`,
                    `${compiledSearchParam.path}.unit${keywordSuffix}`,
                ],
                query: code,
                lenient: true,
            },
        });
    }
    if (queries.length === 1) {
        return queries[0];
    }
    return {
        bool: {
            must: queries,
        },
    };
};
exports.quantityQuery = quantityQuery;
//# sourceMappingURL=quantityQuery.js.map