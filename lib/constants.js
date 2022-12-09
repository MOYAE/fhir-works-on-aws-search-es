"use strict";
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_INCLUSION_PARAM_RESULTS = exports.MAX_CHAINED_PARAMS_RESULT = exports.MAX_ES_WINDOW_SIZE = exports.NON_SEARCHABLE_PARAMETERS = exports.COMPILED_CONDITION_OPERATOR_RESOLVE = exports.SORT_PARAMETER = exports.UNSUPPORTED_GENERAL_PARAMETERS = exports.INCLUSION_PARAMETERS = exports.ITERATIVE_INCLUSION_PARAMETERS = exports.SEPARATOR = exports.DEFAULT_SEARCH_RESULTS_PER_PAGE = void 0;
exports.DEFAULT_SEARCH_RESULTS_PER_PAGE = 20;
exports.SEPARATOR = '_';
exports.ITERATIVE_INCLUSION_PARAMETERS = ['_include:iterate', '_revinclude:iterate'];
exports.INCLUSION_PARAMETERS = ['_include', '_revinclude', ...exports.ITERATIVE_INCLUSION_PARAMETERS];
exports.UNSUPPORTED_GENERAL_PARAMETERS = ['_format', '_pretty', '_summary', '_elements'];
exports.SORT_PARAMETER = '_sort';
exports.COMPILED_CONDITION_OPERATOR_RESOLVE = 'resolve';
exports.NON_SEARCHABLE_PARAMETERS = [
    exports.SORT_PARAMETER,
    "_getpagesoffset" /* PAGES_OFFSET */,
    "_count" /* COUNT */,
    ...exports.INCLUSION_PARAMETERS,
    ...exports.UNSUPPORTED_GENERAL_PARAMETERS,
];
exports.MAX_ES_WINDOW_SIZE = 10000;
exports.MAX_CHAINED_PARAMS_RESULT = 100;
exports.MAX_INCLUSION_PARAM_RESULTS = 1000;
//# sourceMappingURL=constants.js.map