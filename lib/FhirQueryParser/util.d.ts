export declare const parseSearchModifiers: (searchParameter: string) => {
    parameterName: string;
    modifier?: string | undefined;
};
export declare const normalizeQueryParams: (queryParams: any) => {
    [key: string]: string[];
};
export declare const isChainedParameter: (parameterKey: string) => boolean;
