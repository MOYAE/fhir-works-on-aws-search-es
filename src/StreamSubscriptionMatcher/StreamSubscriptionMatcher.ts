/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import { DynamoDBStreamEvent } from 'aws-lambda/trigger/dynamodb-stream';
import { chunk } from 'lodash';
import { FhirVersion, Persistence } from 'fhir-works-on-aws-interface';
import { v4 } from 'uuid';
import { SNSClient, PublishBatchCommand } from '@aws-sdk/client-sns';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import https from 'https';
import { captureAWSv3Client } from 'aws-xray-sdk';
import {
    buildNotification,
    filterOutIneligibleResources,
    parseSubscription,
    Subscription,
    SubscriptionNotification,
} from './subscriptions';
import { matchParsedFhirQueryParams } from '../InMemoryMatcher';
import { FHIRSearchParametersRegistry } from '../FHIRSearchParametersRegistry';
import { AsyncRefreshCache } from './AsyncRefreshCache';
import getComponentLogger from '../loggerBuilder';

const SNS_MAX_BATCH_SIZE = 10;
const ACTIVE_SUBSCRIPTIONS_CACHE_REFRESH_TIMEOUT = 60_000;

const logger = getComponentLogger();

const matchSubscription = (subscription: Subscription, resource: Record<string, any>): boolean => {
    return (
        // eslint-disable-next-line no-underscore-dangle
        subscription.tenantId === resource._tenantId &&
        matchParsedFhirQueryParams(subscription.parsedCriteria, resource)
    );
};

/**
 * This class matches DynamoDBStreamEvents against the active Subscriptions and publishes SNS messages for each match.
 */
// eslint-disable-next-line import/prefer-default-export
export class StreamSubscriptionMatcher {
    private readonly fhirSearchParametersRegistry: FHIRSearchParametersRegistry;

    private readonly persistence: Persistence;

    private readonly topicArn: string;

    private readonly snsClient: SNSClient;

    private activeSubscriptions: AsyncRefreshCache<Subscription[]>;

    /**
     * @param persistence - Persistence implementation. Used to fetch the active Subscriptions
     * @param topicArn - arn of the SNS topic where notifications will be sent
     * @param options.fhirVersion - FHIR version. Used to determine how to interpret search parameters
     * @param options.compiledImplementationGuides - Additional search parameters from implementation guides
     */
    constructor(
        persistence: Persistence,
        topicArn: string,
        {
            fhirVersion = '4.0.1',
            compiledImplementationGuides,
        }: { fhirVersion?: FhirVersion; compiledImplementationGuides?: any } = {},
    ) {
        this.persistence = persistence;
        this.topicArn = topicArn;
        this.fhirSearchParametersRegistry = new FHIRSearchParametersRegistry(fhirVersion, compiledImplementationGuides);

        this.activeSubscriptions = new AsyncRefreshCache<Subscription[]>(async () => {
            logger.error('Refreshing cache of active subscriptions...');

            const activeSubscriptions: Subscription[] = (await this.persistence.getActiveSubscriptions({})).map(
                (resource) => parseSubscription(resource, this.fhirSearchParametersRegistry),
            );

            logger.error(`found ${activeSubscriptions.length} active subscriptions`);

            return activeSubscriptions;
        }, ACTIVE_SUBSCRIPTIONS_CACHE_REFRESH_TIMEOUT);

        const agent = new https.Agent({
            maxSockets: 150,
        });

        this.snsClient = captureAWSv3Client(
            new SNSClient({
                region: process.env.AWS_REGION || 'us-west-2',
                maxAttempts: 2,
                requestHandler: new NodeHttpHandler({ httpsAgent: agent }),
            }),
        );
    }

    async match(dynamoDBStreamEvent: DynamoDBStreamEvent): Promise<void> {
        logger.error(`DynamoDb records in event: ${dynamoDBStreamEvent.Records.length}`);
        const eligibleResources = filterOutIneligibleResources(dynamoDBStreamEvent);
        logger.error(`FHIR resource create/update records: ${eligibleResources.length}`);

        const activeSubscriptions = await this.activeSubscriptions.get();
        logger.error(`Active Subscriptions: ${activeSubscriptions.length}`);

        const subscriptionNotifications: SubscriptionNotification[] = activeSubscriptions.flatMap((subscription) => {
            return eligibleResources
                .filter((resource) => matchSubscription(subscription, resource))
                .map((resource) => buildNotification(subscription, resource));
        });

        logger.error(
            'Summary of notifications:',
            JSON.stringify(
                subscriptionNotifications.map((s) => ({
                    subscriptionId: `Subscription/${s.subscriptionId}`,
                    resourceId: `${s.matchedResource.resourceType}/${s.matchedResource.id}`,
                })),
            ),
        );

        await Promise.all(
            chunk(subscriptionNotifications, SNS_MAX_BATCH_SIZE).map((subscriptionNotificationBatch) => {
                const command = new PublishBatchCommand({
                    PublishBatchRequestEntries: subscriptionNotificationBatch.map((subscriptionNotification) => ({
                        Id: v4(), // The ID only needs to be unique within a batch. A UUID works well here
                        Message: JSON.stringify(subscriptionNotification),
                        MessageAttributes: {
                            channelType: { DataType: 'String', StringValue: subscriptionNotification.channelType },
                        },
                    })),
                    TopicArn: this.topicArn,
                });
                return this.snsClient.send(command);
            }),
        );
        logger.error(`Notifications sent: ${subscriptionNotifications.length}`);
    }
}
