"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUniqueTarget = void 0;
// eslint-disable-next-line import/prefer-default-export
const fhir_works_on_aws_interface_1 = require("fhir-works-on-aws-interface");
const constants_1 = require("../constants");
const util_1 = require("../FhirQueryParser/util");
function getUniqueTarget(fhirSearchParam) {
    if (!fhirSearchParam.target) {
        return undefined;
    }
    if (fhirSearchParam.target.length === 1) {
        return fhirSearchParam.target[0];
    }
    let target;
    for (let i = 0; i < fhirSearchParam.compiled.length; i += 1) {
        // check compiled[].condition for resolution
        const compiled = fhirSearchParam.compiled[i]; // we can use ! since we checked length before
        // condition's format is defined in `../FHIRSearchParamtersRegistry/index.ts`
        if (compiled.condition && compiled.condition[1] === constants_1.COMPILED_CONDITION_OPERATOR_RESOLVE) {
            if (!target) {
                // eslint-disable-next-line prefer-destructuring
                target = compiled.condition[2];
            }
            else if (target !== compiled.condition[2]) {
                // case where two compiled resolve to different resource types
                return undefined;
            }
        }
        else {
            // if there is no resolve condition, we have multiple resources pointed to.
            return undefined;
        }
    }
    // case for resolution to resource type that isn't contained in the target group
    if (target && !fhirSearchParam.target.includes(target)) {
        return undefined;
    }
    return target;
}
exports.getUniqueTarget = getUniqueTarget;
const parseChainedParameters = (fhirSearchParametersRegistry, resourceType, queryParams) => {
    const parsedChainedParam = Object.entries((0, util_1.normalizeQueryParams)(queryParams))
        .filter(([searchParameter]) => !constants_1.NON_SEARCHABLE_PARAMETERS.includes(searchParameter) && (0, util_1.isChainedParameter)(searchParameter))
        .flatMap(([searchParameter, searchValues]) => {
        // Validate chain and add resource type
        const chain = searchParameter.split('.');
        const lastChain = chain.pop();
        let currentResourceType = resourceType;
        const organizedChain = [];
        chain.forEach((currentSearchParam) => {
            var _a;
            const searchModifier = (0, util_1.parseSearchModifiers)(currentSearchParam);
            const fhirSearchParam = fhirSearchParametersRegistry.getSearchParameter(currentResourceType, searchModifier.parameterName);
            if (fhirSearchParam === undefined) {
                throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError(`Invalid search parameter '${searchModifier.parameterName}' for resource type ${currentResourceType}`);
            }
            if (fhirSearchParam.type !== 'reference') {
                throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError(`Chained search parameter '${searchModifier.parameterName}' for resource type ${currentResourceType} is not a reference.`);
            }
            let nextResourceType;
            if (searchModifier.modifier) {
                if ((_a = fhirSearchParam.target) === null || _a === void 0 ? void 0 : _a.includes(searchModifier.modifier)) {
                    organizedChain.push({
                        resourceType: currentResourceType,
                        searchParam: searchModifier.parameterName,
                    });
                    nextResourceType = searchModifier.modifier;
                }
                else {
                    throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError(`Chained search parameter '${searchModifier.parameterName}' for resource type ${currentResourceType} does not point to resource type ${searchModifier.modifier}.`);
                }
            }
            else {
                const target = getUniqueTarget(fhirSearchParam);
                if (!target) {
                    throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError(`Chained search parameter '${searchModifier.parameterName}' for resource type ${currentResourceType} points to multiple resource types, please specify.`);
                }
                organizedChain.push({
                    resourceType: currentResourceType,
                    searchParam: searchModifier.parameterName,
                });
                nextResourceType = target;
            }
            currentResourceType = nextResourceType;
        });
        organizedChain.push({ resourceType: currentResourceType, searchParam: lastChain });
        return {
            chain: organizedChain.reverse(),
            initialValue: searchValues,
        };
    });
    return parsedChainedParam;
};
exports.default = parseChainedParameters;
//# sourceMappingURL=chain.js.map