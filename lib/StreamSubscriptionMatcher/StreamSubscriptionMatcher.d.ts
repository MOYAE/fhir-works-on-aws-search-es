import { DynamoDBStreamEvent } from 'aws-lambda/trigger/dynamodb-stream';
import { FhirVersion, Persistence } from 'fhir-works-on-aws-interface';
/**
 * This class matches DynamoDBStreamEvents against the active Subscriptions and publishes SNS messages for each match.
 */
export declare class StreamSubscriptionMatcher {
    private readonly fhirSearchParametersRegistry;
    private readonly persistence;
    private readonly topicArn;
    private readonly snsClient;
    private activeSubscriptions;
    /**
     * @param persistence - Persistence implementation. Used to fetch the active Subscriptions
     * @param topicArn - arn of the SNS topic where notifications will be sent
     * @param options.fhirVersion - FHIR version. Used to determine how to interpret search parameters
     * @param options.compiledImplementationGuides - Additional search parameters from implementation guides
     */
    constructor(persistence: Persistence, topicArn: string, { fhirVersion, compiledImplementationGuides, }?: {
        fhirVersion?: FhirVersion;
        compiledImplementationGuides?: any;
    });
    match(dynamoDBStreamEvent: DynamoDBStreamEvent): Promise<void>;
}
