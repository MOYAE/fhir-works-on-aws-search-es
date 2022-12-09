export interface ReferenceSearchValueIdOnly {
    referenceType: 'idOnly';
    id: string;
}
export interface ReferenceSearchValueRelative {
    referenceType: 'relative';
    id: string;
    resourceType: string;
}
export interface ReferenceSearchValueUrl {
    referenceType: 'url';
    fhirServiceBaseUrl: string;
    id: string;
    resourceType: string;
}
export interface ReferenceSearchValueUnparseable {
    referenceType: 'unparseable';
    rawValue: string;
}
export declare type ReferenceSearchValue = ReferenceSearchValueIdOnly | ReferenceSearchValueRelative | ReferenceSearchValueUrl | ReferenceSearchValueUnparseable;
export declare const parseReferenceSearchValue: ({ target, name }: {
    target?: string[] | undefined;
    name: string;
}, param: string) => ReferenceSearchValue;
