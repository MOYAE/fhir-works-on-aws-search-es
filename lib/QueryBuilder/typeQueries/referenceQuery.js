"use strict";
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.referenceQuery = void 0;
const fhir_works_on_aws_interface_1 = require("fhir-works-on-aws-interface");
const SUPPORTED_MODIFIERS = [];
// eslint-disable-next-line import/prefer-default-export
function referenceQuery(compiled, value, useKeywordSubFields, baseUrl, searchParamName, target = [], modifier) {
    if (modifier && !SUPPORTED_MODIFIERS.includes(modifier)) {
        throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError(`Unsupported reference search modifier: ${modifier}`);
    }
    let references = [];
    switch (value.referenceType) {
        case 'idOnly':
            references = target.flatMap((targetType) => {
                return [`${baseUrl}/${targetType}/${value.id}`, `${targetType}/${value.id}`];
            });
            break;
        case 'relative':
            references.push(`${value.resourceType}/${value.id}`);
            references.push(`${baseUrl}/${value.resourceType}/${value.id}`);
            break;
        case 'url':
            if (value.fhirServiceBaseUrl === baseUrl) {
                references.push(`${value.resourceType}/${value.id}`);
            }
            references.push(`${value.fhirServiceBaseUrl}/${value.resourceType}/${value.id}`);
            break;
        case 'unparseable':
            references.push(value.rawValue);
            break;
        default:
            // eslint-disable-next-line no-case-declarations
            const exhaustiveCheck = value;
            return exhaustiveCheck;
    }
    const keywordSuffix = useKeywordSubFields ? '.keyword' : '';
    return { terms: { [`${compiled.path}.reference${keywordSuffix}`]: references } };
}
exports.referenceQuery = referenceQuery;
//# sourceMappingURL=referenceQuery.js.map