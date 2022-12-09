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
exports.parseDateSearchValue = void 0;
const fhir_works_on_aws_interface_1 = require("fhir-works-on-aws-interface");
const parseISO_1 = __importDefault(require("date-fns/parseISO"));
const isValid_1 = __importDefault(require("date-fns/isValid"));
const set_1 = __importDefault(require("date-fns/set"));
const lastDayOfMonth_1 = __importDefault(require("date-fns/lastDayOfMonth"));
const lastDayOfYear_1 = __importDefault(require("date-fns/lastDayOfYear"));
// The date parameter format is yyyy-mm-ddThh:mm:ss[Z|(+|-)hh:mm] (the standard XML format).
// https://www.hl7.org/fhir/search.html#date
const DATE_SEARCH_PARAM_REGEX = /^(?<prefix>eq|ne|lt|gt|ge|le|sa|eb|ap)?(?<inputDate>(?<year>\d{4})(?:-(?<month>\d{2})(?:-(?<day>\d{2})(?:T(?<hours>\d{2}):(?<minutes>\d{2})(?::(?<seconds>\d{2})(?:\.(?<milliseconds>\d{3}))?(?<timeZone>Z|[+-](?:\d{2}:\d{2}))?)?)?)?)?)$/;
const parseDateSearchValue = (param) => {
    var _a;
    const match = param.match(DATE_SEARCH_PARAM_REGEX);
    if (match === null) {
        throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError(`Invalid date search parameter: ${param}`);
    }
    const { inputDate, month, day, minutes, seconds, milliseconds } = match.groups;
    // If no prefix is present, the prefix eq is assumed.
    // https://www.hl7.org/fhir/search.html#prefix
    const prefix = (_a = match.groups.prefix) !== null && _a !== void 0 ? _a : 'eq';
    const parsedDate = (0, parseISO_1.default)(inputDate);
    if (!(0, isValid_1.default)(parsedDate)) {
        throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError(`Invalid date format: ${inputDate}`);
    }
    // When the date parameter is not fully specified, matches against it are based on the behavior of intervals
    // https://www.hl7.org/fhir/search.html#date
    let endDate;
    const timeEndOfDay = { hours: 23, minutes: 59, seconds: 59, milliseconds: 999 };
    if (milliseconds !== undefined) {
        endDate = parsedDate; // date is fully specified
    }
    else if (seconds !== undefined) {
        endDate = (0, set_1.default)(parsedDate, { milliseconds: 999 });
    }
    else if (minutes !== undefined) {
        endDate = (0, set_1.default)(parsedDate, { seconds: 59, milliseconds: 999 });
    }
    else if (day !== undefined) {
        endDate = (0, set_1.default)(parsedDate, timeEndOfDay);
    }
    else if (month !== undefined) {
        endDate = (0, set_1.default)((0, lastDayOfMonth_1.default)(parsedDate), timeEndOfDay);
    }
    else {
        endDate = (0, set_1.default)((0, lastDayOfYear_1.default)(parsedDate), timeEndOfDay);
    }
    return {
        prefix,
        range: {
            start: parsedDate,
            end: endDate,
        },
    };
};
exports.parseDateSearchValue = parseDateSearchValue;
//# sourceMappingURL=dateParser.js.map