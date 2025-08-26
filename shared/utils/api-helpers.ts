import { $fetchWithSettings } from './config-helpers'

/**
 * Update operations using LLM prompt
 */
export const updateOperationsWithLLM = async (
  request: {
    operations: OperationPlan[]
    userPrompt: string
    systemPrompts: Array<{
      id: string
      name: string
      content: string
      active: boolean
    }>
  }): Promise<{
  success: boolean
  updatedOperations: OperationPlan[]
  reasoning: string
  warnings: string[]
}> => {
  try {
    const response = await $fetchWithSettings('/api/update-operations', {
      method: 'POST',
      body: {
        operations: request.operations,
        userPrompt: request.userPrompt,
        systemPrompts: request.systemPrompts
      }
    })

    const typedResponse = response as { operations: OperationPlan[], reasoning: string, warnings: string[] }
    return {
      success: true,
      updatedOperations: typedResponse.operations,
      reasoning: typedResponse.reasoning || 'Operations updated successfully',
      warnings: typedResponse.warnings || []
    }
  } catch (error) {
    console.error('Failed to update operations with LLM:', error)
    return {
      success: false,
      updatedOperations: request.operations,
      reasoning: 'Failed to update operations',
      warnings: [error instanceof Error ? error.message : 'Unknown error occurred']
    }
  }
}

/**
 * Validate operation fields against schema (if available)
 */
export const validateOperationFields = (
  fields: Record<string, any>,
  schema?: Array<{ name: string; type: string; options?: string[] }>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!schema || schema.length === 0) {
    return { isValid: true, errors }
  }
  
  // Check for required fields (title/name type fields)
  const titleField = schema.find(f => f.type === 'title')
  if (titleField && !fields[titleField.name]) {
    errors.push(`${titleField.name} is required`)
  }
  
  // Check select field options
  for (const field of schema) {
    if (field.type === 'select' && fields[field.name] && field.options) {
      const value = fields[field.name]
      if (!field.options.includes(value)) {
        errors.push(`${field.name} must be one of: ${field.options.join(', ')}`)
      }
    }
    
    if (field.type === 'multi_select' && fields[field.name] && field.options) {
      const values = Array.isArray(fields[field.name]) ? fields[field.name] : []
      const invalidValues = values.filter((v: any) => !field.options!.includes(v))
      if (invalidValues.length > 0) {
        errors.push(`${field.name} contains invalid options: ${invalidValues.join(', ')}`)
      }
    }
  }
  
  return { isValid: errors.length === 0, errors }
}