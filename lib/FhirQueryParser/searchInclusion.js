"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseInclusionParams = exports.inclusionParameterFromString = void 0;
const lodash_1 = require("lodash");
const fhir_works_on_aws_interface_1 = require("fhir-works-on-aws-interface");
const inclusionParameterFromString = (s) => {
    if (s === '*') {
        return { isWildcard: true };
    }
    const INCLUSION_PARAM_REGEX = /^(?<sourceResource>[A-Za-z]+):(?<searchParameter>[A-Za-z-]+)(?::(?<targetResourceType>[A-Za-z]+))?$/;
    const match = s.match(INCLUSION_PARAM_REGEX);
    if (match === null) {
        throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError(`Invalid include/revinclude search parameter: ${s}`);
    }
    const { sourceResource, searchParameter, targetResourceType } = match.groups;
    return {
        isWildcard: false,
        sourceResource,
        searchParameter,
        targetResourceType,
    };
};
exports.inclusionParameterFromString = inclusionParameterFromString;
const parseInclusionParams = (fhirSearchParametersRegistry, searchParameter, value) => {
    return (0, lodash_1.uniq)(value).map((v) => {
        const inclusionParam = (0, exports.inclusionParameterFromString)(v);
        const colonIndex = searchParameter.indexOf(':') === -1 ? searchParameter.length : searchParameter.indexOf(':');
        const type = searchParameter.substring(0, colonIndex);
        const isIterate = searchParameter.substring(colonIndex + 1) === 'iterate' ? true : undefined;
        if (!inclusionParam.isWildcard) {
            const searchParam = fhirSearchParametersRegistry.getReferenceSearchParameter(inclusionParam.sourceResource, inclusionParam.searchParameter, inclusionParam.targetResourceType);
            if ('error' in searchParam) {
                throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError(`Invalid include/revinclude search parameter: ${searchParam.error}`);
            }
            inclusionParam.path = searchParam.compiled[0].path;
        }
        return {
            type,
            ...(isIterate && { isIterate }),
            ...inclusionParam,
        };
    });
};
exports.parseInclusionParams = parseInclusionParams;
//# sourceMappingURL=searchInclusion.js.map