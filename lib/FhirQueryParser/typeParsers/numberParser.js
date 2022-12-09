"use strict";
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNumberSearchValue = void 0;
const fhir_works_on_aws_interface_1 = require("fhir-works-on-aws-interface");
const number_1 = require("../../QueryBuilder/typeQueries/common/number");
const NUMBER_SEARCH_PARAM_REGEX = /^(?<prefix>eq|ne|lt|gt|ge|le|sa|eb|ap)?(?<numberString>[\d.+-eE]+)$/;
const parseNumberSearchValue = (param) => {
    var _a;
    const match = param.match(NUMBER_SEARCH_PARAM_REGEX);
    if (match === null) {
        throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError(`Invalid number search parameter: ${param}`);
    }
    const { numberString } = match.groups;
    // If no prefix is present, the prefix eq is assumed.
    // https://www.hl7.org/fhir/search.html#prefix
    const prefix = (_a = match.groups.prefix) !== null && _a !== void 0 ? _a : 'eq';
    const fhirNumber = (0, number_1.parseNumber)(numberString);
    return {
        prefix,
        ...fhirNumber,
    };
};
exports.parseNumberSearchValue = parseNumberSearchValue;
//# sourceMappingURL=numberParser.js.map