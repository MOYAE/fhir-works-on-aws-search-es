"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocumentField = void 0;
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const SEARCH_PARAMETER_TO_DOCUMENT_FIELD = {
    _id: 'id',
    id: 'id',
};
const hasMapping = (searchParameter) => {
    return searchParameter in SEARCH_PARAMETER_TO_DOCUMENT_FIELD;
};
// eslint-disable-next-line import/prefer-default-export
const getDocumentField = (searchParameter) => {
    if (hasMapping(searchParameter)) {
        return SEARCH_PARAMETER_TO_DOCUMENT_FIELD[searchParameter];
    }
    return `${searchParameter}.*`;
};
exports.getDocumentField = getDocumentField;
//# sourceMappingURL=searchParametersMapping.js.map