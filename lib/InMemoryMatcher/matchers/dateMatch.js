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
exports.dateMatch = void 0;
const isValid_1 = __importDefault(require("date-fns/isValid"));
const parseISO_1 = __importDefault(require("date-fns/parseISO"));
const numericComparison_1 = require("./common/numericComparison");
// eslint-disable-next-line import/prefer-default-export
const dateMatch = (searchValue, resourceValue) => {
    const { prefix, range } = searchValue;
    const numericSearchRange = { start: range.start.getTime(), end: range.end.getTime() };
    if (typeof resourceValue === 'string') {
        const parsedDate = (0, parseISO_1.default)(resourceValue);
        if (!(0, isValid_1.default)(parsedDate)) {
            return false;
        }
        return (0, numericComparison_1.compareNumberToRange)(prefix, numericSearchRange, parsedDate.getTime());
    }
    if (typeof (resourceValue === null || resourceValue === void 0 ? void 0 : resourceValue.start) === 'string' && typeof (resourceValue === null || resourceValue === void 0 ? void 0 : resourceValue.end) === 'string') {
        const startDate = (0, parseISO_1.default)(resourceValue.start);
        if (!(0, isValid_1.default)(startDate)) {
            return false;
        }
        const endDate = (0, parseISO_1.default)(resourceValue.end);
        if (!(0, isValid_1.default)(endDate)) {
            return false;
        }
        return (0, numericComparison_1.compareRanges)(prefix, numericSearchRange, { start: startDate.getTime(), end: endDate.getTime() });
    }
    return false;
};
exports.dateMatch = dateMatch;
//# sourceMappingURL=dateMatch.js.map