"use strict";
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.numberMatch = void 0;
const numericComparison_1 = require("./common/numericComparison");
// eslint-disable-next-line import/prefer-default-export
const numberMatch = (value, resourceValue) => {
    const { prefix, implicitRange, number } = value;
    if (typeof resourceValue !== 'number') {
        return false;
    }
    return (0, numericComparison_1.compareNumberToRange)(prefix, (0, numericComparison_1.applyPrefixRulesToRange)(prefix, number, implicitRange), resourceValue);
};
exports.numberMatch = numberMatch;
//# sourceMappingURL=numberMatch.js.map