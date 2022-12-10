/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { InvalidSearchParameterError } from 'fhir-works-on-aws-interface';
import { CompiledSearchParam } from '../../FHIRSearchParametersRegistry';
import { TokenSearchValue } from '../../FhirQueryParser';
import getComponentLogger from '../../loggerBuilder';

const logger = getComponentLogger();

// Fields that do not have `.keyword` suffix. This is only important if `useKeywordSubFields` is true
const FIELDS_WITHOUT_KEYWORD = ['id'];
const SUPPORTED_MODIFIERS: string[] = [];

// eslint-disable-next-line import/prefer-default-export
export function tokenQuery(
    compiled: CompiledSearchParam,
    value: TokenSearchValue,
    useKeywordSubFields: boolean,
    modifier?: string,
): any {
    if (modifier && !SUPPORTED_MODIFIERS.includes(modifier)) {
        throw new InvalidSearchParameterError(`Unsupported token search modifier: ${modifier}`);
    }

    logger.error(`compiled: ${JSON.stringify(compiled)}`);
    logger.error(`value: ${JSON.stringify(value)}`);
    logger.error(`useKeywordSubFields: ${useKeywordSubFields}`);
    logger.error(`modifer: ${modifier}`);

    const { system, code, explicitNoSystemProperty } = value;

    logger.error(`system: ${system}`);
    logger.error(`code: ${code}`);
    logger.error(`explicitNoSystemProperty: ${explicitNoSystemProperty}`);
    const queries = [];
    const useKeywordSuffix = useKeywordSubFields && !FIELDS_WITHOUT_KEYWORD.includes(compiled.path);
    const keywordSuffix = useKeywordSuffix ? '.keyword' : '';

    // Token search params are used for many different field types. Search is not aware of the types of the fields in FHIR resources.
    // The field type is specified in StructureDefinition, but not in SearchParameter.
    // We are doing a multi_match against all the applicable fields. non-existent fields are simply ignored.
    // Queries can be simplified if Search gets to know the field types from the StructureDefinitions.
    // See: https://www.hl7.org/fhir/search.html#token
    if (system !== undefined) {
        logger.error('inside of system is not undefined');
        const fields = [
            `${compiled.path}.system${keywordSuffix}`, // Coding, Identifier
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
            `${compiled.path}.code${keywordSuffix}`, // Coding
            `${compiled.path}.coding.code${keywordSuffix}`, // CodeableConcept
            `${compiled.path}.value${keywordSuffix}`, // Identifier, ContactPoint
            `${compiled.path}${keywordSuffix}`, // code, uri, string, boolean
        ];

        // accommodate for boolean value when keywordSuffix is used, as .keyword field is not created for boolean value
        if (useKeywordSuffix) {
            fields.push(`${compiled.path}`);
        }

        if (compiled.path === 'intent' && code === 'order') {
            queries.push({
                bool: {
                    must: {
                        term: { intent: 'order' },
                    },
                },
            });
        } else if (compiled.path === 'intent' && code === 'original-order') {
            queries.push({
                bool: {
                    must: {
                        term: { intent: 'original-order' },
                    },
                },
            });
        } else {
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
