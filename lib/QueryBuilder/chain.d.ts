import { FHIRSearchParametersRegistry, SearchParam } from '../FHIRSearchParametersRegistry';
export interface ChainParameter {
    chain: {
        resourceType: string;
        searchParam: string;
    }[];
    initialValue: string[];
}
export declare function getUniqueTarget(fhirSearchParam: SearchParam): string | undefined;
declare const parseChainedParameters: (fhirSearchParametersRegistry: FHIRSearchParametersRegistry, resourceType: string, queryParams: any) => ChainParameter[];
export default parseChainedParameters;
