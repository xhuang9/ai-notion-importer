import { Client } from '@notionhq/client'

interface RequestBody {
  operations: OperationPlan[]
}

interface ExecutionResult {
  success: boolean
  operation: OperationPlan
  notionPageId?: string
  error?: string
}

export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    })
  }

  const body = await readBody(event) as RequestBody
  const config = getMergedConfig(event)
  const validation = validateRequiredSettings(config)

  if (!body.operations || !Array.isArray(body.operations) || body.operations.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No operations provided'
    })
  }

  if (!validation.isValid) {
    throw createError({
      statusCode: 500,
      statusMessage: `Missing required configuration: ${validation.missing.join(', ')}`
    })
  }

  // Initialize Notion client
  const notion = new Client({
    auth: config.NOTION_API_KEY!
  })

  try {
    // First, get the database schema to understand field types and options
    const database = await notion.databases.retrieve({
      database_id: config.NOTION_DATABASE_ID!
    })

    const schema: NotionFieldSchema[] = []
    for (const [propertyName, property] of Object.entries(database.properties)) {
      const field: NotionFieldSchema = {
        name: propertyName,
        type: property.type
      }

      // Extract options for select and multi_select fields
      if (property.type === 'select' && 'select' in property && property.select?.options) {
        field.options = property.select.options.map(option => option.name)
      } else if (property.type === 'multi_select' && 'multi_select' in property && property.multi_select?.options) {
        field.options = property.multi_select.options.map(option => option.name)
      }

      schema.push(field)
    }

    const results: ExecutionResult[] = []

    // Process each operation
    for (const operation of body.operations) {
      try {
        let result: ExecutionResult

        if (operation.kind === 'create') {
          result = await createNotionTask(notion, config.NOTION_DATABASE_ID!, operation, schema)
        } else if (operation.kind === 'update') {
          result = await updateNotionTask(notion, operation, schema)
        } else if (operation.kind === 'status_change') {
          result = await changeNotionTaskStatus(notion, operation, schema)
        } else {
          result = {
            success: false,
            operation,
            error: `Unsupported operation kind: ${operation.kind}`
          }
        }

        results.push(result)
      } catch (error) {
        console.error(`Error executing operation ${operation.id}:`, error)
        results.push({
          success: false,
          operation,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.length - successCount

    return {
      success: failureCount === 0,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount
      },
      executedAt: new Date().toISOString()
    }

  } catch (error) {
    console.error('Plan execution error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to execute plan'
    })
  }
})

/**
 * Dynamically builds Notion properties based on database schema
 */
function buildNotionProperties(fields: Partial<NotionTask>, schema: NotionFieldSchema[]): any {
  const properties: any = {}

  // Find schema field by name (case-insensitive)
  const findSchemaField = (fieldName: string) => {
    return schema.find(f => f.name.toLowerCase() === fieldName.toLowerCase()) ||
           schema.find(f => f.name === fieldName)
  }

  // Process each field from the operation
  for (const [fieldKey, fieldValue] of Object.entries(fields)) {
    if (fieldValue === undefined || fieldValue === null) continue

    // Map common field names to actual schema names
    const fieldMappings: Record<string, string> = {
      'name': 'Name',
      'title': 'Name',
      'status': 'Status',
      'priority': 'Priority', 
      'due': 'Due',
      'tags': 'Tags',
      'type': 'Type',
      'notes': 'Notes'
    }

    // Dynamically add rank mapping if schema has a rank-like field
    const rankField = schema.find(field => 
      field.name.toLowerCase() === 'rank' || 
      field.name.toLowerCase() === 'ranking' ||
      field.name.toLowerCase() === 'priority_score'
    )
    if (rankField) {
      fieldMappings['rank'] = rankField.name
    }

    const schemaFieldName = fieldMappings[fieldKey.toLowerCase()] || fieldKey
    const schemaField = findSchemaField(schemaFieldName)

    if (!schemaField) {
      console.warn(`Field ${fieldKey} not found in schema, skipping`)
      continue
    }

    // Build property based on field type
    switch (schemaField.type) {
      case 'title':
        properties[schemaField.name] = {
          title: [{ text: { content: String(fieldValue) } }]
        }
        break

      case 'select':
        if (typeof fieldValue === 'string') {
          // Validate against available options
          const validOptions = schemaField.options || []
          const exactMatch = validOptions.find(opt => opt === fieldValue)
          const caseInsensitiveMatch = validOptions.find(opt => opt.toLowerCase() === fieldValue.toLowerCase())
          
          const selectedOption = exactMatch || caseInsensitiveMatch || validOptions[0]
          
          if (selectedOption) {
            properties[schemaField.name] = {
              select: { name: selectedOption }
            }
          }
        }
        break

      case 'multi_select':
        if (Array.isArray(fieldValue)) {
          const validOptions = schemaField.options || []
          const selectedOptions = fieldValue
            .map(val => {
              const exactMatch = validOptions.find(opt => opt === val)
              const caseInsensitiveMatch = validOptions.find(opt => opt.toLowerCase() === val.toLowerCase())
              return exactMatch || caseInsensitiveMatch
            })
            .filter(Boolean)

          if (selectedOptions.length > 0) {
            properties[schemaField.name] = {
              multi_select: selectedOptions.map(name => ({ name }))
            }
          }
        }
        break

      case 'date':
        if (fieldValue) {
          properties[schemaField.name] = {
            date: { start: String(fieldValue) }
          }
        }
        break

      case 'number':
        if (typeof fieldValue === 'number' || !isNaN(Number(fieldValue))) {
          properties[schemaField.name] = {
            number: Number(fieldValue)
          }
        }
        break

      case 'rich_text':
        properties[schemaField.name] = {
          rich_text: [{ text: { content: String(fieldValue) } }]
        }
        break

      default:
        console.warn(`Unsupported field type ${schemaField.type} for field ${schemaField.name}`)
    }
  }

  return properties
}

async function createNotionTask(
  notion: Client,
  databaseId: string,
  operation: OperationPlan,
  schema: NotionFieldSchema[]
): Promise<ExecutionResult> {
  try {
    // Only calculate rank if the schema includes a rank field
    const fieldsToUse = hasRankField(schema) 
      ? { ...operation.fields, rank: calculateRank(operation.fields) }
      : operation.fields

    const properties = buildNotionProperties(fieldsToUse, schema)

    const response = await notion.pages.create({
      parent: {
        database_id: databaseId
      },
      properties
    })

    return {
      success: true,
      operation,
      notionPageId: response.id
    }
  } catch (error) {
    return {
      success: false,
      operation,
      error: error instanceof Error ? error.message : 'Failed to create task'
    }
  }
}

async function updateNotionTask(
  notion: Client,
  operation: OperationPlan,
  schema: NotionFieldSchema[]
): Promise<ExecutionResult> {
  try {
    if (!operation.taskId) {
      return {
        success: false,
        operation,
        error: 'Task ID is required for update operations'
      }
    }

    // Only calculate rank if the schema includes a rank field
    const fieldsToUse = hasRankField(schema)
      ? { ...operation.fields, rank: calculateRank(operation.fields) }
      : operation.fields

    const properties = buildNotionProperties(fieldsToUse, schema)

    const response = await notion.pages.update({
      page_id: operation.taskId,
      properties
    })

    return {
      success: true,
      operation,
      notionPageId: response.id
    }
  } catch (error) {
    return {
      success: false,
      operation,
      error: error instanceof Error ? error.message : 'Failed to update task'
    }
  }
}

async function changeNotionTaskStatus(
  notion: Client,
  operation: OperationPlan,
  schema: NotionFieldSchema[]
): Promise<ExecutionResult> {
  try {
    if (!operation.taskId) {
      return {
        success: false,
        operation,
        error: 'Task ID is required for status change operations'
      }
    }

    const properties = buildNotionProperties({ status: operation.fields.status }, schema)

    const response = await notion.pages.update({
      page_id: operation.taskId,
      properties
    })

    return {
      success: true,
      operation,
      notionPageId: response.id
    }
  } catch (error) {
    return {
      success: false,
      operation,
      error: error instanceof Error ? error.message : 'Failed to change task status'
    }
  }
}

function hasRankField(schema: NotionFieldSchema[]): boolean {
  return schema.some(field => 
    field.name.toLowerCase() === 'rank' || 
    field.name.toLowerCase() === 'ranking' ||
    field.name.toLowerCase() === 'priority_score'
  )
}

function calculateRank(fields: Partial<NotionTask>): number {
  let baseRank = fields.rank || 50
  
  // Priority adjustments
  const priorityBonus: Record<string, number> = {
    'Urgent': 40,
    'High': 20,
    'Important': 20,
    'Medium': 0,
    'Low': -20,
    'Low priority': -20
  }
  
  if (fields.priority) {
    baseRank += priorityBonus[fields.priority] || 0
  }
  
  // Due date urgency adjustments
  if (fields.due) {
    const dueDate = new Date(fields.due)
    const today = new Date()
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDue <= 0) {
      baseRank += 50 // Overdue
    } else if (daysUntilDue <= 3) {
      baseRank += 30 // Due soon
    } else if (daysUntilDue <= 7) {
      baseRank += 15 // Due this week
    }
  }
  
  // Tag-based adjustments
  if (fields.tags) {
    const quickWinTags = ['quick-win', 'easy', 'small', 'minor']
    const importantTags = ['critical', 'important', 'urgent', 'blocker']
    
    if (fields.tags.some(tag => quickWinTags.includes(tag.toLowerCase()))) {
      baseRank += 10 // Quick wins get slight boost
    }
    
    if (fields.tags.some(tag => importantTags.includes(tag.toLowerCase()))) {
      baseRank += 25 // Important items get bigger boost
    }
  }
  
  // Ensure rank stays within reasonable bounds
  return Math.max(0, Math.min(1000, Math.round(baseRank)))
}