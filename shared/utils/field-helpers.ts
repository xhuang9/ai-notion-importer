/**
 * Get the main display value from operation fields
 * Tries common field names for title/name fields
 */
export const getMainFieldValue = (fields: any): string => {
  return fields.name || fields.title || fields.Name || fields.Title || 
         Object.values(fields)[0] as string || 'Untitled'
}

/**
 * Check if a field name should be considered the main/title field
 */
export const isMainField = (fieldName: string): boolean => {
  const mainFields = ['name', 'title', 'Name', 'Title']
  return mainFields.includes(fieldName)
}

/**
 * Format field values for display
 */
export const formatFieldValue = (value: any): string => {
  if (Array.isArray(value)) {
    return value.join(', ')
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value)
  }
  return String(value || '')
}

/**
 * Get all non-main fields for secondary display
 */
export const getSecondaryFields = (fields: any): Record<string, any> => {
  const result: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(fields)) {
    if (!isMainField(key) && value !== null && value !== undefined && value !== '') {
      result[key] = value
    }
  }
  
  return result
}

/**
 * Create an editable form object from operation fields
 */
export const createEditForm = (fields: any): Record<string, any> => {
  const form: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      form[`${key}String`] = value.join(', ')
    } else {
      form[key] = value || ''
    }
  }
  
  return form
}

/**
 * Convert edit form back to operation fields
 */
export const formToFields = (form: Record<string, any>): Record<string, any> => {
  const fields: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(form)) {
    if (key.endsWith('String')) {
      // Handle array fields that were converted to strings
      const fieldName = key.replace('String', '')
      fields[fieldName] = typeof value === 'string' 
        ? value.split(',').map(v => v.trim()).filter(v => v)
        : []
    } else {
      fields[key] = value
    }
  }
  
  return fields
}