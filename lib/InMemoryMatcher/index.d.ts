import { ParsedFhirQueryParams } from '../FhirQueryParser';
/**
 * checks if the given resource is matched by a FHIR search query
 * @param parsedFhirQueryParams - parsed FHIR search query
 * @param resource - FHIR resource to be matched
 * @param options.fhirServiceBaseUrl - URL of the FHIR served where the FHIR resource is located.
 * The URL is used to translate relative references into full URLs and vice versa
 */
export declare function matchParsedFhirQueryParams(parsedFhirQueryParams: ParsedFhirQueryParams, resource: any, { fhirServiceBaseUrl }?: {
    fhirServiceBaseUrl?: string;
}): boolean;
