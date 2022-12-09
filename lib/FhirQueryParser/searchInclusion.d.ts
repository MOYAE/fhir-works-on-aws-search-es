import { InclusionSearchParameter, WildcardInclusionSearchParameter } from '../searchInclusions';
import { FHIRSearchParametersRegistry } from '../FHIRSearchParametersRegistry';
export declare const inclusionParameterFromString: (s: string) => Omit<InclusionSearchParameter, 'type'> | Omit<WildcardInclusionSearchParameter, 'type'>;
export declare const parseInclusionParams: (fhirSearchParametersRegistry: FHIRSearchParametersRegistry, searchParameter: string, value: string[]) => (InclusionSearchParameter | WildcardInclusionSearchParameter)[];
