"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quantityMatch = void 0;
const lodash_1 = require("lodash");
const numericComparison_1 = require("./common/numericComparison");
// eslint-disable-next-line import/prefer-default-export
const quantityMatch = (value, resourceValue) => {
    const { prefix, implicitRange, number, system, code } = value;
    if (typeof (resourceValue === null || resourceValue === void 0 ? void 0 : resourceValue.value) !== 'number') {
        return false;
    }
    if (!(0, numericComparison_1.compareNumberToRange)(prefix, (0, numericComparison_1.applyPrefixRulesToRange)(prefix, number, implicitRange), resourceValue.value)) {
        return false;
    }
    if ((0, lodash_1.isEmpty)(system) && (0, lodash_1.isEmpty)(code)) {
        return true;
    }
    if (!(0, lodash_1.isEmpty)(system) && !(0, lodash_1.isEmpty)(code)) {
        return (resourceValue === null || resourceValue === void 0 ? void 0 : resourceValue.code) === code && (resourceValue === null || resourceValue === void 0 ? void 0 : resourceValue.system) === system;
    }
    if (!(0, lodash_1.isEmpty)(code)) {
        // when there is no system, search either the code (code) or the stated human unit (unit)
        // https://www.hl7.org/fhir/search.html#quantity
        return (resourceValue === null || resourceValue === void 0 ? void 0 : resourceValue.code) === code || (resourceValue === null || resourceValue === void 0 ? void 0 : resourceValue.unit) === code;
    }
    return false;
};
exports.quantityMatch = quantityMatch;
//# sourceMappingURL=quantityMatch.js.map