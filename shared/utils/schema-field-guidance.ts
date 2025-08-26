/**
 * Generate field-specific guidance system prompts from Notion schema
 */

export function generateFieldGuidancePrompts(schema: NotionDatabaseSchema): GeneratedSystemPrompt[] {
  const prompts: GeneratedSystemPrompt[] = []
  
  // Group fields by type for focused guidance
  const fieldsByType = schema.fields.reduce((acc, field) => {
    if (!field.type) return acc
    if (!acc[field.type]) acc[field.type] = []
    acc[field.type]!.push(field)
    return acc
  }, {} as Record<string, NotionFieldSchema[]>)

  // Generate specific guidance for select/multi-select fields
  const selectFields = fieldsByType['select'] || []
  const multiSelectFields = fieldsByType['multi_select'] || []
  
  if (selectFields.length > 0 || multiSelectFields.length > 0) {
    let content = '# Select Field Usage Guide\n\n'
    
    if (selectFields.length > 0) {
      content += '## Single-Select Fields\nThese fields accept exactly ONE value from the specified options:\n\n'
      selectFields.forEach(field => {
        if (field.options && field.options.length > 0) {
          content += `**${field.name}**: ${field.options.join(', ')}\n`
          content += generateCommonMappings(field.name, field.options) + '\n\n'
        }
      })
    }
    
    if (multiSelectFields.length > 0) {
      content += '## Multi-Select Fields\nThese fields accept ARRAYS of values from the specified options:\n\n'
      multiSelectFields.forEach(field => {
        if (field.options && field.options.length > 0) {
          content += `**${field.name}**: [${field.options.map(opt => `"${opt}"`).join(', ')}]\n`
          content += generateCommonMappings(field.name, field.options) + '\n\n'
        }
      })
    }
    
    content += `
**IMPORTANT:** 
- Only use the EXACT option values listed above
- Never create new select options or use similar/synonymous terms
- For multi-select fields, always use arrays even for single values
- Case-sensitive matching is required`

    prompts.push({
      name: 'Select Field Guidelines',
      content,
      category: 'field-guidance'
    })
  }

  return prompts
}

export function generateCommonMappings(fieldName: string, options: string[]): string {
  const lowerName = fieldName.toLowerCase()
  let mappings = ''
  
  if (lowerName.includes('priority')) {
    mappings += `Common priority mappings for ${fieldName}:\n`
    options.forEach(option => {
      const lower = option.toLowerCase()
      if (lower.includes('high') || lower.includes('urgent')) {
        mappings += `- "urgent", "high priority", "important" → "${option}"\n`
      } else if (lower.includes('medium') || lower.includes('normal')) {
        mappings += `- "normal", "medium priority", "regular" → "${option}"\n`
      } else if (lower.includes('low')) {
        mappings += `- "low priority", "nice to have", "minor" → "${option}"\n`
      }
    })
  }
  
  if (lowerName.includes('status')) {
    mappings += `Common status mappings for ${fieldName}:\n`
    options.forEach(option => {
      const lower = option.toLowerCase()
      if (lower.includes('not') || lower.includes('todo') || lower.includes('new')) {
        mappings += `- "new", "todo", "pending", "not started" → "${option}"\n`
      } else if (lower.includes('progress') || lower.includes('doing') || lower.includes('active')) {
        mappings += `- "in progress", "working", "active", "doing" → "${option}"\n`
      } else if (lower.includes('done') || lower.includes('complete') || lower.includes('finished')) {
        mappings += `- "done", "completed", "finished", "closed" → "${option}"\n`
      } else if (lower.includes('hold') || lower.includes('blocked') || lower.includes('waiting')) {
        mappings += `- "blocked", "on hold", "waiting", "paused" → "${option}"\n`
      }
    })
  }
  
  return mappings
}