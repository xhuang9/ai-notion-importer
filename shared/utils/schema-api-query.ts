/**
 * Generate API query guidance system prompts from Notion schema
 */

export function generateAPIQueryPrompt(schema: NotionDatabaseSchema): GeneratedSystemPrompt {
  const selectFields = schema.fields.filter(f => f.type === 'select' || f.type === 'multi_select')
  const dateFields = schema.fields.filter(f => f.type === 'date')
  const exampleOps = generateExampleOperations(schema.fields)

  const content = `# API Operation Examples for "${schema.title}"

## Example Operations Structure

${exampleOps}

## Field-Specific API Notes

### Select Field API Mapping
${selectFields.map(field => {
  return `**${field.name}** (${field.type}):
- API expects: ${field.type === 'select' ? 'String value' : 'Array of strings'}
- Valid values: ${field.options ? field.options.map(o => `"${o}"`).join(', ') : 'No options defined'}
- Example: ${field.type === 'select' ? `"${field.options?.[0] || 'value'}"` : `["${field.options?.[0] || 'value1'}", "${field.options?.[1] || 'value2'}"]`}`
}).join('\n\n')}

### Date Field API Mapping  
${dateFields.map(field => 
  `**${field.name}**: Use "YYYY-MM-DD" format (e.g., "2024-12-31")`
).join('\n')}

## Operation Guidelines

### CREATE Operations
- Always generate unique ID for each operation
- Include reason explaining why this operation is needed
- Set confidence based on information clarity (60-95%)
- Add warnings for any assumptions or unclear mappings

### UPDATE Operations
- Must include valid taskId from existing database
- Only specify fields that need to be changed
- Higher confidence for updates with known record IDs

### STATUS_CHANGE Operations  
- Simplified update focusing on status transitions
- Should include taskId and status-related fields only
- Use for workflow state changes

## Response Format Requirements
All operations must return valid JSON with this structure:
\`\`\`json
{
  "plan": [
    {
      "id": "generated-uuid",
      "kind": "create|update|status_change",
      "taskId": "existing-record-id-or-null",
      "fields": {
        // Field values following exact schema requirements
      },
      "reason": "Clear explanation of why this operation is needed",
      "confidence": 85,
      "warnings": ["Any concerns or assumptions"]
    }
  ],
  "reasoning": "Overall explanation of the generated plan",
  "warnings": ["Any general warnings about the plan"]
}
\`\`\``

  return {
    name: 'API Query Guide',  
    content,
    category: 'validation-rules'
  }
}

export function generateExampleOperations(fields: NotionFieldSchema[]): string {
  const titleField = fields.find(f => f.type === 'title')
  const selectField = fields.find(f => f.type === 'select')
  const dateField = fields.find(f => f.type === 'date')
  
  const createExample = {
    id: 'create-example-1',
    kind: 'create',
    taskId: null,
    fields: {
      ...(titleField && { [titleField.name]: 'Example Task Name' }),
      ...(selectField && selectField.options && { [selectField.name]: selectField.options[0] }),
      ...(dateField && { [dateField.name]: '2024-12-31' })
    },
    reason: 'Creating new task based on user request',
    confidence: 85,
    warnings: []
  }

  const updateExample = {
    id: 'update-example-1', 
    kind: 'update',
    taskId: 'existing-record-id',
    fields: {
      ...(selectField && selectField.options && { [selectField.name]: selectField.options[1] || selectField.options[0] })
    },
    reason: 'Updating task status based on progress',
    confidence: 90,
    warnings: []
  }

  return `### CREATE Operation Example:
\`\`\`json
${JSON.stringify(createExample, null, 2)}
\`\`\`

### UPDATE Operation Example:
\`\`\`json  
${JSON.stringify(updateExample, null, 2)}
\`\`\``
}