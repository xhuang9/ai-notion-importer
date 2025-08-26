/**
 * Generate database structure system prompts from Notion schema
 */

export function generateDatabaseStructurePrompt(schema: NotionDatabaseSchema): GeneratedSystemPrompt {
  const fieldsList = schema.fields.map(field => {
    const optionsText = field.options ? ` (Options: ${field.options.join(', ')})` : ''
    return `- **${field.name}** (${field.type})${optionsText}: ${field.description}`
  }).join('\n')

  const content = `# Database Structure for "${schema.title}"

You are working with a Notion database that has the following structure:

${fieldsList}

**Critical Implementation Guidelines:**
1. **Field Names**: Use EXACT field names as shown above (case-sensitive)
2. **Field Types**: Respect each field's type and constraints
3. **Select Fields**: ONLY use the exact options listed - no variations or new options
4. **Required Fields**: Always populate title/name fields
5. **API Mapping**: The system will dynamically map your field values to Notion API properties

**Field Mapping Instructions:**
- When you specify fields in operations, the system will automatically:
  - Convert text to appropriate Notion property types
  - Map select field values to their internal IDs
  - Handle multi-select arrays appropriately
  - Format dates as ISO strings
  - Process rich text for description fields

**Critical Rules:**
- Never create new select options - only use existing ones listed above
- Always use the exact field names (case-sensitive)
- For operations updating existing items, include the taskId field
- For new items, leave taskId empty or null

This database structure must be followed exactly for all operations to succeed.`

  return {
    name: 'Database Structure',
    content,
    category: 'database-structure'
  }
}