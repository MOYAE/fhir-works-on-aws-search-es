"use strict";
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamSubscriptionMatcher = void 0;
const lodash_1 = require("lodash");
const uuid_1 = require("uuid");
const client_sns_1 = require("@aws-sdk/client-sns");
const node_http_handler_1 = require("@aws-sdk/node-http-handler");
const https_1 = __importDefault(require("https"));
const aws_xray_sdk_1 = require("aws-xray-sdk");
const subscriptions_1 = require("./subscriptions");
const InMemoryMatcher_1 = require("../InMemoryMatcher");
const FHIRSearchParametersRegistry_1 = require("../FHIRSearchParametersRegistry");
const AsyncRefreshCache_1 = require("./AsyncRefreshCache");
const loggerBuilder_1 = __importDefault(require("../loggerBuilder"));
const SNS_MAX_BATCH_SIZE = 10;
const ACTIVE_SUBSCRIPTIONS_CACHE_REFRESH_TIMEOUT = 60000;
const logger = (0, loggerBuilder_1.default)();
const matchSubscription = (subscription, resource) => {
    return (
    // eslint-disable-next-line no-underscore-dangle
    subscription.tenantId === resource._tenantId &&
        (0, InMemoryMatcher_1.matchParsedFhirQueryParams)(subscription.parsedCriteria, resource));
};
/**
 * This class matches DynamoDBStreamEvents against the active Subscriptions and publishes SNS messages for each match.
 */
// eslint-disable-next-line import/prefer-default-export
class StreamSubscriptionMatcher {
    /**
     * @param persistence - Persistence implementation. Used to fetch the active Subscriptions
     * @param topicArn - arn of the SNS topic where notifications will be sent
     * @param options.fhirVersion - FHIR version. Used to determine how to interpret search parameters
     * @param options.compiledImplementationGuides - Additional search parameters from implementation guides
     */
    constructor(persistence, topicArn, { fhirVersion = '4.0.1', compiledImplementationGuides, } = {}) {
        this.persistence = persistence;
        this.topicArn = topicArn;
        this.fhirSearchParametersRegistry = new FHIRSearchParametersRegistry_1.FHIRSearchParametersRegistry(fhirVersion, compiledImplementationGuides);
        this.activeSubscriptions = new AsyncRefreshCache_1.AsyncRefreshCache(async () => {
            logger.error('Refreshing cache of active subscriptions...');
            const activeSubscriptions = (await this.persistence.getActiveSubscriptions({})).map((resource) => (0, subscriptions_1.parseSubscription)(resource, this.fhirSearchParametersRegistry));
            logger.error(`found ${activeSubscriptions.length} active subscriptions`);
            return activeSubscriptions;
        }, ACTIVE_SUBSCRIPTIONS_CACHE_REFRESH_TIMEOUT);
        const agent = new https_1.default.Agent({
            maxSockets: 150,
        });
        this.snsClient = (0, aws_xray_sdk_1.captureAWSv3Client)(new client_sns_1.SNSClient({
            region: process.env.AWS_REGION || 'us-west-2',
            maxAttempts: 2,
            requestHandler: new node_http_handler_1.NodeHttpHandler({ httpsAgent: agent }),
        }));
    }
    async match(dynamoDBStreamEvent) {
        logger.error(`DynamoDb records in event: ${dynamoDBStreamEvent.Records.length}`);
        const eligibleResources = (0, subscriptions_1.filterOutIneligibleResources)(dynamoDBStreamEvent);
        logger.error(`FHIR resource create/update records: ${eligibleResources.length}`);
        const activeSubscriptions = await this.activeSubscriptions.get();
        logger.error(`Active Subscriptions: ${activeSubscriptions.length}`);
        const subscriptionNotifications = activeSubscriptions.flatMap((subscription) => {
            return eligibleResources
                .filter((resource) => matchSubscription(subscription, resource))
                .map((resource) => (0, subscriptions_1.buildNotification)(subscription, resource));
        });
        logger.error('Summary of notifications:', JSON.stringify(subscriptionNotifications.map((s) => ({
            subscriptionId: `Subscription/${s.subscriptionId}`,
            resourceId: `${s.matchedResource.resourceType}/${s.matchedResource.id}`,
        }))));
        await Promise.all((0, lodash_1.chunk)(subscriptionNotifications, SNS_MAX_BATCH_SIZE).map((subscriptionNotificationBatch) => {
            const command = new client_sns_1.PublishBatchCommand({
                PublishBatchRequestEntries: subscriptionNotificationBatch.map((subscriptionNotification) => ({
                    Id: (0, uuid_1.v4)(),
                    Message: JSON.stringify(subscriptionNotification),
                    MessageAttributes: {
                        channelType: { DataType: 'String', StringValue: subscriptionNotification.channelType },
                    },
                })),
                TopicArn: this.topicArn,
            });
            return this.snsClient.send(command);
        }));
        logger.error(`Notifications sent: ${subscriptionNotifications.length}`);
    }
}
exports.StreamSubscriptionMatcher = StreamSubscriptionMatcher;
//# sourceMappingURL=StreamSubscriptionMatcher.js.map