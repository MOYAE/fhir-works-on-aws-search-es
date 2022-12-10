import { StringLikeSearchValue } from '../../FhirQueryParser';
import { CompiledSearchParam } from '../../FHIRSearchParametersRegistry';
export declare const stringMatch: (compiledSearchParam: CompiledSearchParam, value: StringLikeSearchValue, resourceValue: unknown, modifier?: string) => boolean;
