/**
 * This mappings will be applied to ALL resource types (they override any existing mappings).
 */
export declare const CUSTOM_MAPPINGS: {
    id: {
        type: string;
        index: boolean;
    };
    resourceType: {
        type: string;
        index: boolean;
    };
    _references: {
        type: string;
        index: boolean;
    };
    documentStatus: {
        type: string;
        index: boolean;
    };
    _tenantId: {
        type: string;
        index: boolean;
    };
};
