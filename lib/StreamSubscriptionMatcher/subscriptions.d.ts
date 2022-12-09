import { DynamoDBStreamEvent } from 'aws-lambda/trigger/dynamodb-stream';
import { FHIRSearchParametersRegistry } from '../FHIRSearchParametersRegistry';
import { ParsedFhirQueryParams } from '../FhirQueryParser';
export interface Subscription {
    subscriptionId: string;
    tenantId?: string;
    channelType: string;
    channelHeader: string[];
    channelPayload: string;
    endpoint: string;
    parsedCriteria: ParsedFhirQueryParams;
}
export interface SubscriptionNotification {
    subscriptionId: string;
    tenantId?: string;
    channelType: string;
    endpoint: string;
    channelPayload: string;
    channelHeader: string[];
    matchedResource: {
        id: string;
        resourceType: string;
        versionId: string;
        lastUpdated: string;
    };
}
export declare const buildNotification: (subscription: Subscription, resource: Record<string, any>) => SubscriptionNotification;
export declare const filterOutIneligibleResources: (dynamoDBStreamEvent: DynamoDBStreamEvent) => Record<string, any>[];
export declare const parseSubscription: (resource: Record<string, any>, fhirSearchParametersRegistry: FHIRSearchParametersRegistry) => Subscription;
