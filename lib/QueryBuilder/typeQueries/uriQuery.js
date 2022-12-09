"use strict";
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.uriQuery = void 0;
const fhir_works_on_aws_interface_1 = require("fhir-works-on-aws-interface");
const SUPPORTED_MODIFIERS = [];
// eslint-disable-next-line import/prefer-default-export
function uriQuery(compiled, value, useKeywordSubFields, modifier) {
    if (modifier && !SUPPORTED_MODIFIERS.includes(modifier)) {
        throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError(`Unsupported URI search modifier: ${modifier}`);
    }
    const keywordSuffix = useKeywordSubFields ? '.keyword' : '';
    return {
        multi_match: {
            fields: [`${compiled.path}${keywordSuffix}`],
            query: value,
            lenient: true,
        },
    };
}
exports.uriQuery = uriQuery;
//# sourceMappingURL=uriQuery.js.map