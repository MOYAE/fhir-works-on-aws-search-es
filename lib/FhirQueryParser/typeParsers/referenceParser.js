"use strict";
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseReferenceSearchValue = void 0;
const fhir_works_on_aws_interface_1 = require("fhir-works-on-aws-interface");
const loggerBuilder_1 = __importDefault(require("../../loggerBuilder"));
const logger = (0, loggerBuilder_1.default)();
const ID_ONLY_REGEX = /^[A-Za-z0-9\-.]{1,64}$/;
const FHIR_REFERENCE_REGEX = /^((?<fhirServiceBaseUrl>https?:\/\/[A-Za-z0-9\-\\.:%$_/]+)\/)?(?<resourceType>[A-Z][a-zA-Z]+)\/(?<id>[A-Za-z0-9\-.]{1,64})$/;
const parseReferenceSearchValue = ({ target, name }, param) => {
    const match = param.match(FHIR_REFERENCE_REGEX);
    if (match) {
        const { fhirServiceBaseUrl, resourceType, id } = match.groups;
        if (fhirServiceBaseUrl) {
            return {
                referenceType: 'url',
                id,
                resourceType,
                fhirServiceBaseUrl,
            };
        }
        return {
            referenceType: 'relative',
            id,
            resourceType,
        };
    }
    if (ID_ONLY_REGEX.test(param)) {
        if (target === undefined || target.length === 0) {
            logger.error(`ID only reference search failed. The requested search parameter: '${name}',  does not have any targets. Please ensure the compiled IG is valid`);
            throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError(`ID only search for '${name}' parameter is not supported, please specify the value with the format [resourceType]/[id] or as an absolute URL`);
        }
        return {
            referenceType: 'idOnly',
            id: param,
        };
    }
    return {
        referenceType: 'unparseable',
        rawValue: param,
    };
};
exports.parseReferenceSearchValue = parseReferenceSearchValue;
//# sourceMappingURL=referenceParser.js.map