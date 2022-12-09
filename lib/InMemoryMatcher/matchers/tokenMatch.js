"use strict";
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenMatch = void 0;
// eslint-disable-next-line import/prefer-default-export
const tokenMatch = (searchValue, resourceValue) => {
    const { system, code, explicitNoSystemProperty } = searchValue;
    // CodeableConcept may have several Codings
    if (resourceValue === null || resourceValue === void 0 ? void 0 : resourceValue.coding) {
        if (Array.isArray(resourceValue === null || resourceValue === void 0 ? void 0 : resourceValue.coding)) {
            return resourceValue === null || resourceValue === void 0 ? void 0 : resourceValue.coding.some((coding) => (0, exports.tokenMatch)(searchValue, coding));
        }
        return (0, exports.tokenMatch)(searchValue, resourceValue === null || resourceValue === void 0 ? void 0 : resourceValue.coding);
    }
    const codeValues = [
        resourceValue === null || resourceValue === void 0 ? void 0 : resourceValue.code,
        resourceValue === null || resourceValue === void 0 ? void 0 : resourceValue.value,
        resourceValue, // code, uri, string, boolean
    ];
    const systemValue = resourceValue === null || resourceValue === void 0 ? void 0 : resourceValue.system;
    if (explicitNoSystemProperty && systemValue !== undefined) {
        return false;
    }
    if (system !== undefined && systemValue !== system) {
        return false;
    }
    if (code !== undefined &&
        codeValues.every((codeValue) => {
            if (typeof codeValue === 'boolean') {
                return (code === 'true' && !codeValue) || (code === 'false' && codeValue);
            }
            return codeValue !== code;
        })) {
        return false;
    }
    return true;
};
exports.tokenMatch = tokenMatch;
//# sourceMappingURL=tokenMatch.js.map