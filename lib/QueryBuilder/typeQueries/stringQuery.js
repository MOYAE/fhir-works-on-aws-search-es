"use strict";
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringQuery = void 0;
const fhir_works_on_aws_interface_1 = require("fhir-works-on-aws-interface");
const escapeQueryString = (string) => {
    return string.replace(/\//g, '\\/');
};
const SUPPORTED_MODIFIERS = ['exact', 'contains'];
// eslint-disable-next-line import/prefer-default-export
function stringQuery(compiled, value, modifier) {
    if (modifier && !SUPPORTED_MODIFIERS.includes(modifier)) {
        throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError(`Unsupported string search modifier: ${modifier}`);
    }
    if (modifier === 'contains') {
        const fields = [`${compiled.path}`];
        if (compiled.path === 'name') {
            // name is a special parameter.
            // name.* cannot be used in wildcard queries so we specify the fields to search.
            fields.push('name.family', 'name.given', 'name.text', 'name.prefix', 'name.suffix');
        }
        if (compiled.path === 'address') {
            // address is a special parameter.
            // address.* cannot be used in wildcard queries so we specify the fields to search.
            fields.push('address.city', 'address.country', 'address.district', 'address.line', 'address.postalCode', 'address.state', 'address.text');
        }
        const queries = fields.map((field) => ({
            wildcard: {
                [field]: {
                    value: `*${value.toLowerCase()}*`,
                },
            },
        }));
        if (queries.length === 1) {
            return queries[0];
        }
        return {
            bool: {
                should: queries,
            },
        };
    }
    const keywordSuffix = modifier === 'exact' ? '.keyword' : '';
    const fields = [compiled.path + keywordSuffix, `${compiled.path}.*${keywordSuffix}`];
    return {
        multi_match: {
            fields,
            query: escapeQueryString(value),
            lenient: true,
        },
    };
}
exports.stringQuery = stringQuery;
//# sourceMappingURL=stringQuery.js.map