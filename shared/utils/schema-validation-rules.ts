/**
 * Generate validation rules system prompts from Notion schema
 */

export function generateValidationRulesPrompt(schema: NotionDatabaseSchema): GeneratedSystemPrompt {
  const titleFields = schema.fields.filter(f => f.type === 'title')
  const selectFields = schema.fields.filter(f => f.type === 'select' || f.type === 'multi_select')
  const dateFields = schema.fields.filter(f => f.type === 'date')
  
  const content = `# Data Validation Rules for "${schema.title}"

## Required Field Validation
${titleFields.length > 0 ? `- **Title/Name Fields**: ${titleFields.map(f => f.name).join(', ')} - REQUIRED for all operations` : '- No title fields identified'}

## Field Type Validation
### Select Field Restrictions
${selectFields.map(field => {
  const type = field.type === 'select' ? 'Single value' : 'Array of values'
  const options = field.options ? field.options.join('", "') : 'No options defined'
  return `- **${field.name}** (${field.type}): ${type} from ["${options}"]`
}).join('\n')}

### Date Field Format
${dateFields.length > 0 ? dateFields.map(f => `- **${f.name}**: Use YYYY-MM-DD format only`).join('\n') : '- No date fields identified'}

## Operation-Specific Rules

### CREATE Operations
- Must include all required fields
- Leave taskId empty/null
- Use appropriate confidence levels (60-95%)
- Include warnings for any uncertain mappings

### UPDATE Operations  
- Must include valid taskId from existing database records
- Only modify fields that need updating
- Preserve existing field values not being changed
- Use higher confidence for known records (70-95%)

### STATUS_CHANGE Operations
- Must include valid taskId
- Focus on status-related fields only
- Validate status transitions are logical
- High confidence for simple status updates (80-95%)

## Confidence Level Guidelines
- **90-95%**: Clear, unambiguous requirements with exact field matches
- **75-89%**: Good requirements but some field mapping assumptions
- **60-74%**: Reasonable interpretation but may need user verification  
- **40-59%**: Uncertain mappings or missing key information
- **Below 40%**: High uncertainty, significant user review needed

## Warning Triggers
Always add warnings for:
- Unknown or non-standard field values
- Date format ambiguity
- Missing required information
- Assumptions made about user intent
- Operations that might affect multiple records`

  return {
    name: 'Validation Rules',
    content,
    category: 'validation-rules'
  }
}