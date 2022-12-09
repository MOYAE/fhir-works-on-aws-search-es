import { ReferenceSearchValue } from '../../FhirQueryParser/typeParsers/referenceParser';
/**
 * @param searchValue - parsed search value
 * @param resourceValue - value from the FHIR resource
 * @param options.fhirServiceBaseUrl - URL of the FHIR served where the FHIR resource is located.
 * The URL is used to translate relative references into full URLs and vice versa
 * @param options.target - target resource types of the search parameter being evaluated.
 */
export declare const referenceMatch: (searchValue: ReferenceSearchValue, resourceValue: any, { fhirServiceBaseUrl, target }: {
    fhirServiceBaseUrl?: string | undefined;
    target?: string[] | undefined;
}) => boolean;
