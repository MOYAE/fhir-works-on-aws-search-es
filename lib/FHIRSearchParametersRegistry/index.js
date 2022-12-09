"use strict";
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FHIRSearchParametersRegistry = void 0;
const compiledSearchParameters_4_0_1_json_1 = __importDefault(require("../schema/compiledSearchParameters.4.0.1.json"));
const compiledSearchParameters_3_0_1_json_1 = __importDefault(require("../schema/compiledSearchParameters.3.0.1.json"));
const toCapabilityStatement = (searchParam) => ({
    name: searchParam.name,
    definition: searchParam.url,
    type: searchParam.type,
    documentation: searchParam.description,
});
/**
 * This class is the single authority over the supported FHIR SearchParameters and their definitions
 */
// eslint-disable-next-line import/prefer-default-export
class FHIRSearchParametersRegistry {
    constructor(fhirVersion, compiledImplementationGuides) {
        let compiledSearchParams;
        if (fhirVersion === '4.0.1') {
            compiledSearchParams = compiledSearchParameters_4_0_1_json_1.default;
        }
        else {
            compiledSearchParams = compiledSearchParameters_3_0_1_json_1.default;
        }
        if (compiledImplementationGuides !== undefined) {
            // order is important. params from IGs are added last so that they overwrite base FHIR params with the same name
            compiledSearchParams = [...compiledSearchParams, ...compiledImplementationGuides];
        }
        this.includeMap = {};
        this.revincludeMap = {};
        this.typeNameMap = {};
        this.capabilityStatement = {};
        compiledSearchParams.forEach((searchParam) => {
            var _a, _b, _c;
            this.typeNameMap[searchParam.base] = (_a = this.typeNameMap[searchParam.base]) !== null && _a !== void 0 ? _a : {};
            this.typeNameMap[searchParam.base][searchParam.name] = searchParam;
            if (searchParam.type === 'reference') {
                this.includeMap[searchParam.base] = (_b = this.includeMap[searchParam.base]) !== null && _b !== void 0 ? _b : [];
                this.includeMap[searchParam.base].push(searchParam);
                // eslint-disable-next-line no-unused-expressions
                (_c = searchParam.target) === null || _c === void 0 ? void 0 : _c.forEach((target) => {
                    var _a;
                    this.revincludeMap[target] = (_a = this.revincludeMap[target]) !== null && _a !== void 0 ? _a : [];
                    this.revincludeMap[target].push(searchParam);
                });
            }
        });
        Object.entries(this.typeNameMap).forEach(([resourceType, searchParams]) => {
            var _a, _b, _c, _d, _e;
            if (resourceType === 'Resource') {
                // search params of type Resource are handled separately since they must appear on ALL resource types
                return;
            }
            this.capabilityStatement[resourceType] = (_a = this.capabilityStatement[resourceType]) !== null && _a !== void 0 ? _a : {};
            this.capabilityStatement[resourceType].searchParam = Object.values(searchParams).map(toCapabilityStatement);
            this.capabilityStatement[resourceType].searchInclude = [
                '*',
                ...((_c = (_b = this.includeMap[resourceType]) === null || _b === void 0 ? void 0 : _b.map((searchParam) => `${searchParam.base}:${searchParam.name}`)) !== null && _c !== void 0 ? _c : []),
            ];
            this.capabilityStatement[resourceType].searchRevInclude = [
                '*',
                ...((_e = (_d = this.revincludeMap[resourceType]) === null || _d === void 0 ? void 0 : _d.map((searchParam) => `${searchParam.base}:${searchParam.name}`)) !== null && _e !== void 0 ? _e : []),
            ];
        });
        const resourceSearchParams = Object.values(this.typeNameMap.Resource).map(toCapabilityStatement);
        // For each resource type, add all search params that have "Resource" as base, except when there is already
        // a more specific search parameter with the same name.
        Object.entries(this.capabilityStatement).forEach(([resourceType, searchCapabilities]) => {
            searchCapabilities.searchParam.push(...resourceSearchParams.filter((resourceSearchParam) => { var _a, _b; return !((_b = (_a = this.typeNameMap) === null || _a === void 0 ? void 0 : _a[resourceType]) === null || _b === void 0 ? void 0 : _b[resourceSearchParam.name]); }));
        });
    }
    /**
     * Retrieve a search parameter. Returns undefined if the parameter is not found on the registry.
     * @param resourceType FHIR resource type
     * @param name search parameter name
     * @return the matching SearchParam or undefined if there's no match
     */
    getSearchParameter(resourceType, name) {
        var _a, _b, _c, _d;
        return ((_b = (_a = this.typeNameMap) === null || _a === void 0 ? void 0 : _a[resourceType]) === null || _b === void 0 ? void 0 : _b[name]) || ((_d = (_c = this.typeNameMap) === null || _c === void 0 ? void 0 : _c.Resource) === null || _d === void 0 ? void 0 : _d[name]);
    }
    /**
     * Retrieve a search parameter of type "reference"
     * @param resourceType
     * @param name
     * @param targetResourceType
     * @return the matching SearchParam or error message if there's no match
     */
    getReferenceSearchParameter(resourceType, name, targetResourceType) {
        var _a;
        const searchParam = this.getSearchParameter(resourceType, name);
        if (searchParam === undefined) {
            return { error: `Search parameter ${name} does not exist in resource ${resourceType}` };
        }
        if (searchParam.type !== 'reference') {
            return { error: `Search parameter ${name} is not of type reference in resource ${resourceType}` };
        }
        if (targetResourceType !== undefined && !((_a = searchParam.target) === null || _a === void 0 ? void 0 : _a.includes(targetResourceType))) {
            return {
                error: `Search parameter ${name} in resource ${resourceType} does not point to target resource type ${targetResourceType}`,
            };
        }
        return searchParam;
    }
    /**
     * Retrieve all the SearchParams that can be used in _include queries for a given resource type
     * @param resourceType
     */
    getIncludeSearchParameters(resourceType) {
        var _a;
        return (_a = this.includeMap[resourceType]) !== null && _a !== void 0 ? _a : [];
    }
    /**
     * Retrieve all the SearchParams that can be used in _revinclude queries for a given resource type
     * @param resourceType
     */
    getRevIncludeSearchParameters(resourceType) {
        var _a;
        return (_a = this.revincludeMap[resourceType]) !== null && _a !== void 0 ? _a : [];
    }
    /**
     * Retrieve a subset of the CapabilityStatement with the search-related fields for all resources
     * See https://www.hl7.org/fhir/capabilitystatement.html
     */
    getCapabilities() {
        return this.capabilityStatement;
    }
}
exports.FHIRSearchParametersRegistry = FHIRSearchParametersRegistry;
//# sourceMappingURL=index.js.map