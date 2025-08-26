/**
 * LLM prompts for analysis and validation tasks
 */

export const SCHEMA_ANALYSIS_PROMPT = `You are a database schema analyzer. Examine the provided Notion database structure and provide insights about the field types, relationships, and optimal usage patterns.`;

export const VALIDATION_PROMPT = `You are a data validator. Check the provided operations against the database schema and identify any issues, inconsistencies, or improvements.`;

export const OPERATION_EXPLANATION_PROMPT = `You are an operation explainer. Take the provided database operations and explain in plain language what actions will be performed and their expected outcomes.`;

export const CONNECTION_TEST_MESSAGE = 'Respond with only the word "OK" (no other text) to confirm the connection is working.';