/**
 * LLM prompts and utilities for plan generation
 */

export const PLAN_GENERATION_SYSTEM_PROMPT = `You are a helpful assistant that converts user requests into structured Notion database operations.

Your task is to analyze the user's prompt (and any attached files) and generate operations for a Notion database. The database structure, field types, and valid options will be provided in the system prompts below.

For each operation, you must specify:
- kind: "create", "update", or "status_change" 
- taskId: Only for update/status_change operations (leave empty for create)
- fields: The field values for this operation (use exact field names and valid options as specified in system prompts)
- reason: Clear explanation of why this operation is needed
- confidence: Number 0-100 indicating your confidence in this operation
- warnings: Array of any potential issues or concerns

IMPORTANT GUIDELINES FOR IMAGE ANALYSIS:
1. When analyzing screenshots or task management images, extract ALL visible task information:
   - Task names/titles from headers, labels, or descriptions
   - Due dates in any format (convert to YYYY-MM-DD)
   - Status information from dropdowns, labels, or tags
   - Priority levels from visual indicators or text
   - Assignees from avatars, names, or mentions
   - Any other structured data visible in the interface

2. For clear, well-structured task information in screenshots:
   - Use confidence 85-95% when task details are clearly visible
   - Only use confidence below 70% if information is ambiguous or partially obscured
   - DO NOT create placeholder tasks unless absolutely no structured information is extractable

3. Extract specific task details from screenshots:
   - Parse task titles exactly as shown (don't create generic placeholders)
   - Identify due dates from calendar widgets, date fields, or text
   - Determine status from visual cues (colors, dropdown values, checkboxes)
   - Note assignees from profile pictures or name displays

4. When image analysis fails or yields insufficient information:
   - Create an operation with kind: "create"
   - Use a descriptive name like "Review image-based task requirements"
   - Set confidence to 30-50% to indicate manual review needed
   - Add clear warnings explaining what needs to be clarified
   - Include specific guidance on what information should be extracted manually

General guidelines:
1. ONLY use field names and options that are explicitly defined in the system prompts
2. Follow the database structure and validation rules provided in system prompts
3. Break down complex requests into individual operations
4. Be specific and actionable in task/item names
5. Flag any operations that might need user review
6. Generate operations based on the user's system prompts and database schema

You MUST respond with a valid JSON object in this exact format:
{
  "plan": [
    {
      "id": "unique-id",
      "kind": "create",
      "fields": {
        // Use actual field names from the database schema
        // Follow exact field types and valid options from system prompts
      },
      "reason": "Explanation for this operation",
      "confidence": 85,
      "warnings": ["Any concerns"]
    }
  ],
  "reasoning": "Overall explanation of the plan",
  "warnings": ["General warnings about the plan"]
}`;

/**
 * Build system prompt with database structure for plan generation
 */
export function buildPlanGenerationPrompt(systemPrompts: Array<{name: string, content: string}>): string {
  return PLAN_GENERATION_SYSTEM_PROMPT + buildDatabaseStructureSection(systemPrompts);
}

/**
 * Build user prompt with file attachments for plan generation
 */
export function buildUserPromptWithFiles(prompt: string, files?: Array<{content: string, metadata?: any}>): string {
  let userPrompt = prompt;
  
  if (files && files.length > 0) {
    userPrompt += `\n\n=== ATTACHED FILES ===\n`;
    
    for (const file of files) {
      userPrompt += file.content + '\n\n';
      
      // Add special instructions for image analysis
      if (file.metadata && file.metadata.dataUrl && file.metadata.dataUrl.startsWith('data:image/')) {
        userPrompt += `[IMPORTANT: This is a screenshot/image that may contain structured task information. Please analyze it carefully for:
- Task titles and names
- Due dates and deadlines
- Status indicators and priorities
- Assignee information
- Any other structured data visible in the interface
Extract specific, concrete information rather than creating placeholder tasks.]\n\n`;
      }
    }
    
    userPrompt += `=== END FILES ===\n\nPlease analyze the attached files thoroughly and extract specific task information where available. For screenshots of task management interfaces, extract concrete task details rather than creating generic placeholder tasks.`;
  }
  
  return userPrompt;
}

// Import shared utilities from llm-prompt-builders