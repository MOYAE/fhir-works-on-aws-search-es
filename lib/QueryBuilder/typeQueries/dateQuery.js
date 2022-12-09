"use strict";
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateQuery = void 0;
const fhir_works_on_aws_interface_1 = require("fhir-works-on-aws-interface");
const prefixRange_1 = require("./common/prefixRange");
const SUPPORTED_MODIFIERS = [];
// eslint-disable-next-line import/prefer-default-export
const dateQuery = (compiledSearchParam, value, modifier) => {
    if (modifier && !SUPPORTED_MODIFIERS.includes(modifier)) {
        throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError(`Unsupported date search modifier: ${modifier}`);
    }
    const { prefix, range } = value;
    return (0, prefixRange_1.prefixRangeDate)(prefix, range, compiledSearchParam.path);
};
exports.dateQuery = dateQuery;
//# sourceMappingURL=dateQuery.js.map