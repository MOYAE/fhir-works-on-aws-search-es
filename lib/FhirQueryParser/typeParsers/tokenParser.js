"use strict";
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTokenSearchValue = void 0;
const fhir_works_on_aws_interface_1 = require("fhir-works-on-aws-interface");
// eslint-disable-next-line import/prefer-default-export
const parseTokenSearchValue = (param) => {
    if (param === '|') {
        throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError(`Invalid token search parameter: ${param}`);
    }
    const parts = param.split('|');
    if (parts.length > 2) {
        throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError(`Invalid token search parameter: ${param}`);
    }
    let system;
    let code;
    let explicitNoSystemProperty = false;
    if (parts.length === 1) {
        [code] = parts;
    }
    else {
        [system, code] = parts;
        if (system === '') {
            system = undefined;
            explicitNoSystemProperty = true;
        }
        if (code === '') {
            code = undefined;
        }
    }
    return { system, code, explicitNoSystemProperty };
};
exports.parseTokenSearchValue = parseTokenSearchValue;
//# sourceMappingURL=tokenParser.js.map