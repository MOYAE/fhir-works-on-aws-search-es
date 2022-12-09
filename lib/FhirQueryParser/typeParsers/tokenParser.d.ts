export interface TokenSearchValue {
    system?: string;
    code?: string;
    explicitNoSystemProperty: boolean;
}
export declare const parseTokenSearchValue: (param: string) => TokenSearchValue;
