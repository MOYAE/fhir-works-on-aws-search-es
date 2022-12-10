import { FhirVersion, SearchCapabilityStatement } from 'fhir-works-on-aws-interface';
/**
 * name: SearchParameter name
 *
 * url: SearchParameter canonical url
 *
 * type: SearchParameter type
 *
 * description: SearchParameter description
 *
 * base: SearchParameter base resource type
 *
 * target: SearchParameter target. Only used for parameters with type reference
 *
 * compiled: array of objects that can be used to build ES queries. In most cases there is a single element in the array. Multiple elements in the array have on OR relationship between them
 *
 * compiled[].resourceType: FHIR resource type
 *
 * compiled[].path: object path to be used as field in queries
 *
 * compiled[].condition: a 3 element array with the elements of a condition [field, operator, value]
 *
 * @example
 * {
 *    "name": "depends-on",
 *    "url": "http://hl7.org/fhir/SearchParameter/ActivityDefinition-depends-on",
 *    "type": "reference",
 *    "description": "What resource is being referenced",
 *    "base": "ActivityDefinition",
 *    "target": [
 *      "Library",
 *      "Account",
 *      "ActivityDefinition",
 *    ],
 *    "compiled": [
 *      {
 *        "resourceType": "ActivityDefinition",
 *        "path": "relatedArtifact.resource",
 *        "condition": ["relatedArtifact.type", "=", "depends-on"]
 *      },
 *      {"resourceType": "ActivityDefinition", "path": "library"}
 *    ]
 *  }
 *
 */
export type CompiledSearchParam = {
    resourceType: string;
    path: string;
    condition?: string[];
};
export type SearchParam = {
    name: string;
    url: string;
    type: 'composite' | 'date' | 'number' | 'quantity' | 'reference' | 'special' | 'string' | 'token' | 'uri';
    description: string;
    base: string;
    target?: string[];
    compiled: CompiledSearchParam[];
};
/**
 * This class is the single authority over the supported FHIR SearchParameters and their definitions
 */
export declare class FHIRSearchParametersRegistry {
    private readonly includeMap;
    private readonly revincludeMap;
    private readonly typeNameMap;
    private readonly capabilityStatement;
    constructor(fhirVersion: FhirVersion, compiledImplementationGuides?: any[]);
    /**
     * Retrieve a search parameter. Returns undefined if the parameter is not found on the registry.
     * @param resourceType FHIR resource type
     * @param name search parameter name
     * @return the matching SearchParam or undefined if there's no match
     */
    getSearchParameter(resourceType: string, name: string): SearchParam | undefined;
    /**
     * Retrieve a search parameter of type "reference"
     * @param resourceType
     * @param name
     * @param targetResourceType
     * @return the matching SearchParam or error message if there's no match
     */
    getReferenceSearchParameter(resourceType: string, name: string, targetResourceType?: string): SearchParam | {
        error: string;
    };
    /**
     * Retrieve all the SearchParams that can be used in _include queries for a given resource type
     * @param resourceType
     */
    getIncludeSearchParameters(resourceType: string): SearchParam[];
    /**
     * Retrieve all the SearchParams that can be used in _revinclude queries for a given resource type
     * @param resourceType
     */
    getRevIncludeSearchParameters(resourceType: string): SearchParam[];
    /**
     * Retrieve a subset of the CapabilityStatement with the search-related fields for all resources
     * See https://www.hl7.org/fhir/capabilitystatement.html
     */
    getCapabilities(): SearchCapabilityStatement;
}
