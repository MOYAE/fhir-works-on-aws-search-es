/**
 * Gets all values in the given FHIRPath. This function properly handles intermediate array fields.
 *
 * FHIRPath can be misleading since it does not explicitly states the cardinality of fields.
 * e.g. for "Encounter.location.location", "Encounter.location" is an array, so you would access the 1st value as "Encounter.location[0].location"
 *
 * Note: This function can be further optimized by knowing beforehand which fields are arrays. That info can be derived from the FHIR StructureDefinitions
 *
 * @param resource - FHIR resource
 * @param path - path to look for
 *
 * @return array of all values located in the given path.
 */
export declare const getAllValuesForFHIRPath: (resource: any, path: string) => any[];
