"use strict";
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenQuery = void 0;
const fhir_works_on_aws_interface_1 = require("fhir-works-on-aws-interface");
const loggerBuilder_1 = __importDefault(require("../../loggerBuilder"));
const logger = (0, loggerBuilder_1.default)();
// Fields that do not have `.keyword` suffix. This is only important if `useKeywordSubFields` is true
const FIELDS_WITHOUT_KEYWORD = ['id'];
const SUPPORTED_MODIFIERS = [];
// eslint-disable-next-line import/prefer-default-export
function tokenQuery(compiled, value, useKeywordSubFields, modifier) {
    if (modifier && !SUPPORTED_MODIFIERS.includes(modifier)) {
        throw new fhir_works_on_aws_interface_1.InvalidSearchParameterError(`Unsupported token search modifier: ${modifier}`);
    }
    console.log(`compiled: ${JSON.stringify(compiled)}`);
    console.log(`value: ${JSON.stringify(value)}`);
    console.log(`useKeywordSubFields: ${useKeywordSubFields}`);
    console.log(`modifer: ${modifier}`);
    const { system, code, explicitNoSystemProperty } = value;
    console.log(`system: ${system}`);
    console.log(`code: ${code}`);
    console.log(`explicitNoSystemProperty: ${explicitNoSystemProperty}`);
    const queries = [];
    const useKeywordSuffix = useKeywordSubFields && !FIELDS_WITHOUT_KEYWORD.includes(compiled.path);
    const keywordSuffix = useKeywordSuffix ? '.keyword' : '';
    // Token search params are used for many different field types. Search is not aware of the types of the fields in FHIR resources.
    // The field type is specified in StructureDefinition, but not in SearchParameter.
    // We are doing a multi_match against all the applicable fields. non-existent fields are simply ignored.
    // Queries can be simplified if Search gets to know the field types from the StructureDefinitions.
    // See: https://www.hl7.org/fhir/search.html#token
    if (system !== undefined) {
        console.log('inside of system is not undefined');
        const fields = [
            `${compiled.path}.system${keywordSuffix}`,
            `${compiled.path}.coding.system${keywordSuffix}`, // CodeableConcept
        ];
        queries.push({
            multi_match: {
                fields,
                query: system,
                lenient: true,
            },
        });
    }
    if (code !== undefined) {
        // '.code', '.coding.code', 'value' came from the original input data, e.g. language in Patient resource:
        // ${keywordSuffix} came from ElasticSearch field mapping
        console.log('inside of code is not undefined');
        const fields = [
            `${compiled.path}.code${keywordSuffix}`,
            `${compiled.path}.coding.code${keywordSuffix}`,
            `${compiled.path}.value${keywordSuffix}`,
            `${compiled.path}${keywordSuffix}`, // code, uri, string, boolean
        ];
        // accommodate for boolean value when keywordSuffix is used, as .keyword field is not created for boolean value
        if (useKeywordSuffix) {
            fields.push(`${compiled.path}`);
        }
        if (compiled.path === 'intent') {
            queries.push({
                bool: {
                    must: {
                        term: { 'intent.keyword': code },
                    },
                },
            });
        }
        else {
            queries.push({
                multi_match: {
                    fields,
                    query: code,
                    lenient: true,
                },
            });
        }
    }
    if (explicitNoSystemProperty) {
        queries.push({
            bool: {
                must_not: {
                    exists: {
                        field: `${compiled.path}.system`,
                    },
                },
            },
        });
    }
    if (queries.length === 1) {
        logger.error('fell into here');
        logger.error(queries[0]);
        return queries[0];
    }
    const returnObj = {
        bool: {
            must: queries,
        },
    };
    logger.error(`this is the built query, ${JSON.stringify(returnObj)}`);
    return returnObj;
}
exports.tokenQuery = tokenQuery;
//# sourceMappingURL=tokenQuery.js.map