"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSubscription = exports.filterOutIneligibleResources = exports.buildNotification = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const FhirQueryParser_1 = require("../FhirQueryParser");
const loggerBuilder_1 = __importDefault(require("../loggerBuilder"));
const logger = (0, loggerBuilder_1.default)();
const buildNotification = (subscription, resource) => {
    var _a, _b;
    return ({
        subscriptionId: subscription.subscriptionId,
        // eslint-disable-next-line no-underscore-dangle
        tenantId: resource._tenantId,
        channelType: subscription.channelType,
        channelHeader: subscription.channelHeader,
        channelPayload: subscription.channelPayload,
        endpoint: subscription.endpoint,
        matchedResource: {
            // eslint-disable-next-line no-underscore-dangle
            id: resource._tenantId ? resource._id : resource.id,
            resourceType: resource.resourceType,
            lastUpdated: (_a = resource.meta) === null || _a === void 0 ? void 0 : _a.lastUpdated,
            versionId: (_b = resource.meta) === null || _b === void 0 ? void 0 : _b.versionId,
        },
    });
};
exports.buildNotification = buildNotification;
const isCreateOrUpdate = (dynamoDBRecord) => {
    return dynamoDBRecord.eventName === 'INSERT' || dynamoDBRecord.eventName === 'MODIFY';
};
const filterOutIneligibleResources = (dynamoDBStreamEvent) => {
    return dynamoDBStreamEvent.Records.flatMap((dynamoDbRecord) => {
        var _a;
        if (!isCreateOrUpdate(dynamoDbRecord)) {
            // Subscriptions never match deleted resources
            return [];
        }
        if (((_a = dynamoDbRecord.dynamodb) === null || _a === void 0 ? void 0 : _a.NewImage) === undefined) {
            logger.error('dynamodb.NewImage is missing from event. The stream event will be dropped. Is your stream correctly configured?');
            return [];
        }
        const resource = aws_sdk_1.default.DynamoDB.Converter.unmarshall(dynamoDbRecord.dynamodb.NewImage);
        if (resource.documentStatus !== 'AVAILABLE') {
            return [];
        }
        return [resource];
    });
};
exports.filterOutIneligibleResources = filterOutIneligibleResources;
const parseSubscription = (resource, fhirSearchParametersRegistry) => {
    var _a, _b, _c, _d;
    return {
        channelType: (_a = resource === null || resource === void 0 ? void 0 : resource.channel) === null || _a === void 0 ? void 0 : _a.type,
        channelHeader: ((_b = resource === null || resource === void 0 ? void 0 : resource.channel) === null || _b === void 0 ? void 0 : _b.header) || [],
        channelPayload: (_c = resource === null || resource === void 0 ? void 0 : resource.channel) === null || _c === void 0 ? void 0 : _c.payload,
        endpoint: (_d = resource === null || resource === void 0 ? void 0 : resource.channel) === null || _d === void 0 ? void 0 : _d.endpoint,
        parsedCriteria: (0, FhirQueryParser_1.parseQueryString)(fhirSearchParametersRegistry, resource === null || resource === void 0 ? void 0 : resource.criteria),
        // eslint-disable-next-line no-underscore-dangle
        subscriptionId: resource._tenantId ? resource._id : resource.id,
        // eslint-disable-next-line no-underscore-dangle
        tenantId: resource === null || resource === void 0 ? void 0 : resource._tenantId,
    };
};
exports.parseSubscription = parseSubscription;
//# sourceMappingURL=subscriptions.js.map