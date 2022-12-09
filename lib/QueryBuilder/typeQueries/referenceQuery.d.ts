import { CompiledSearchParam } from '../../FHIRSearchParametersRegistry';
import { ReferenceSearchValue } from '../../FhirQueryParser/typeParsers/referenceParser';
export declare function referenceQuery(compiled: CompiledSearchParam, value: ReferenceSearchValue, useKeywordSubFields: boolean, baseUrl: string, searchParamName: string, target?: string[], modifier?: string): any;
