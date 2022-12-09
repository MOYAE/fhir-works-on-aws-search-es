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
exports.getSearchMappings = void 0;
const lodash_1 = require("lodash");
const flat_1 = require("flat");
const searchMappingsBase_3_0_1_json_1 = __importDefault(require("../schema/searchMappingsBase.3.0.1.json"));
const searchMappingsBase_4_0_1_json_1 = __importDefault(require("../schema/searchMappingsBase.4.0.1.json"));
const fhirTypeToESMapping_1 = require("./fhirTypeToESMapping");
const customMappings_1 = require("./customMappings");
/**
 * Get the search mappings for ALL resource types
 * @param fhirVersion
 */
// eslint-disable-next-line import/prefer-default-export
const getSearchMappings = (fhirVersion) => {
    let searchMappings;
    switch (fhirVersion) {
        case '3.0.1':
            searchMappings = searchMappingsBase_3_0_1_json_1.default;
            break;
        case '4.0.1':
            searchMappings = searchMappingsBase_4_0_1_json_1.default;
            break;
        default:
            throw new Error(`search mappings are not available for FHIR version ${fhirVersion}`);
    }
    const searchableFieldsMappings = (0, lodash_1.mapValues)(searchMappings, (fieldsArr) => fieldsArr.map(fhirTypeToESMapping_1.fhirToESMapping).filter((x) => x.mapping !== undefined));
    const flatMappings = (0, lodash_1.mapValues)(searchableFieldsMappings, (fieldsArr) => fieldsArr.reduce((acc, field) => {
        const fieldWithIntermediateProperties = field.field.split('.').join('.properties.');
        acc[fieldWithIntermediateProperties] = field.mapping;
        return acc;
    }, {}));
    const mappings = (0, lodash_1.mapValues)(flatMappings, (x) => (0, flat_1.unflatten)(x));
    // All resourceTypes inherit the fields from Resource
    const resourceMappings = mappings.Resource;
    delete mappings.Resource;
    const mergedMappings = (0, lodash_1.mapValues)(mappings, (x) => ({ ...x, ...resourceMappings, ...customMappings_1.CUSTOM_MAPPINGS }));
    return (0, lodash_1.mapValues)(mergedMappings, (x) => ({
        dynamic: false,
        properties: x,
    }));
};
exports.getSearchMappings = getSearchMappings;
//# sourceMappingURL=index.js.map