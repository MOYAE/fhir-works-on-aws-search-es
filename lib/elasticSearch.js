"use strict";
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElasticSearch = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const elasticsearch_1 = require("@elastic/elasticsearch");
// @ts-ignore
const aws_elasticsearch_connector_1 = require("aws-elasticsearch-connector");
const { IS_OFFLINE } = process.env;
let esDomainEndpoint = process.env.ELASTICSEARCH_DOMAIN_ENDPOINT || 'https://fake-es-endpoint.com';
if (IS_OFFLINE === 'true') {
    aws_sdk_1.default.config.update({
        region: process.env.AWS_REGION || 'us-west-2',
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_KEY,
    });
    esDomainEndpoint = process.env.OFFLINE_ELASTICSEARCH_DOMAIN_ENDPOINT || 'https://fake-es-endpoint.com';
}
// eslint-disable-next-line import/prefer-default-export
exports.ElasticSearch = new elasticsearch_1.Client({
    node: esDomainEndpoint,
    Connection: aws_elasticsearch_connector_1.AmazonConnection,
    Transport: aws_elasticsearch_connector_1.AmazonTransport,
});
//# sourceMappingURL=elasticSearch.js.map