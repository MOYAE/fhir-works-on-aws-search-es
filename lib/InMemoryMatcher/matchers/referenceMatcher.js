"use strict";
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.referenceMatch = void 0;
/**
 * @param searchValue - parsed search value
 * @param resourceValue - value from the FHIR resource
 * @param options.fhirServiceBaseUrl - URL of the FHIR served where the FHIR resource is located.
 * The URL is used to translate relative references into full URLs and vice versa
 * @param options.target - target resource types of the search parameter being evaluated.
 */
// eslint-disable-next-line import/prefer-default-export
const referenceMatch = (searchValue, resourceValue, { fhirServiceBaseUrl, target = [] }) => {
    const reference = resourceValue === null || resourceValue === void 0 ? void 0 : resourceValue.reference;
    switch (searchValue.referenceType) {
        case 'idOnly':
            return target.some((targetType) => (fhirServiceBaseUrl !== undefined &&
                `${fhirServiceBaseUrl}/${targetType}/${searchValue.id}` === reference) ||
                `${targetType}/${searchValue.id}` === reference);
        case 'relative':
            return ((fhirServiceBaseUrl !== undefined &&
                `${fhirServiceBaseUrl}/${searchValue.resourceType}/${searchValue.id}` === reference) ||
                `${searchValue.resourceType}/${searchValue.id}` === reference);
        case 'url':
            return (`${searchValue.fhirServiceBaseUrl}/${searchValue.resourceType}/${searchValue.id}` === reference ||
                (fhirServiceBaseUrl !== undefined &&
                    searchValue.fhirServiceBaseUrl === fhirServiceBaseUrl &&
                    `${searchValue.resourceType}/${searchValue.id}` === reference));
        case 'unparseable':
            return reference === searchValue.rawValue;
        default:
            // eslint-disable-next-line no-case-declarations
            const exhaustiveCheck = searchValue;
            return exhaustiveCheck;
    }
};
exports.referenceMatch = referenceMatch;
//# sourceMappingURL=referenceMatcher.js.map