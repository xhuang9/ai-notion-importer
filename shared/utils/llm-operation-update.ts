/**
 * LLM prompts and utilities for operation updates
 */

export const OPERATION_UPDATE_SYSTEM_PROMPT = `You are a helpful assistant that modifies existing Notion database operations based on user requests.

You will receive:
1. A list of existing operations with their current field values
2. A user request describing how to modify these operations
3. Database structure and validation rules in the system prompts below

Your task is to modify the existing operations according to the user's request while maintaining the database structure and field validation rules.

Important guidelines:
1. ONLY use field names and options that are explicitly defined in the system prompts
2. Maintain the original operation structure (id, kind, taskId, reason, confidence)
3. Only modify the 'fields' object and 'warnings' array as needed
4. Mark any modified operations with "edited": true
5. Preserve operations that don't need changes
6. If a change would violate database rules, add appropriate warnings instead

You MUST respond with a valid JSON object in this exact format:
{
  "operations": [
    {
      "id": "original-id",
      "kind": "create",
      "taskId": null,
      "fields": {
        // Modified field values following system prompt rules
      },
      "reason": "Original or updated reason",
      "confidence": 85,
      "warnings": ["Any new warnings about changes"],
      "approved": false,
      "edited": true
    }
  ],
  "reasoning": "Explanation of what changes were made and why",
  "warnings": ["Any general warnings about the modifications"]
}`;

/**
 * Build system prompt with database structure for operation updates
 */
export function buildOperationUpdatePrompt(systemPrompts: Array<{name: string, content: string}>): string {
  return OPERATION_UPDATE_SYSTEM_PROMPT + buildDatabaseStructureSection(systemPrompts);
}

/**
 * Build user prompt for operation updates with context
 */
export function buildOperationUpdateUserPrompt(
  userPrompt: string, 
  operations: Array<{id: string, kind: string, fields: any, reason: string, confidence: number, warnings: string[], approved: boolean, edited: boolean}>
): string {
  const operationsContext = operations.map((op, index) => ({
    index: index + 1,
    id: op.id,
    kind: op.kind,
    fields: op.fields,
    reason: op.reason,
    confidence: op.confidence,
    warnings: op.warnings || [],
    approved: op.approved || false,
    edited: op.edited || false
  }));

  return `Here are the current operations to modify:

${JSON.stringify(operationsContext, null, 2)}

User Request: ${userPrompt}

Please modify the operations according to the user's request while following the database structure rules provided in the system prompts. Return the updated operations array with any necessary changes applied.`;
}

// Import shared utilities from llm-prompt-builders