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

  const config = useRuntimeConfig()
  const body = await readBody(event) as RequestBody

  if (!body.operations || !Array.isArray(body.operations) || body.operations.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No operations provided'
    })
  }

  if (!config.notionApiKey || !config.notionDatabaseId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Notion API configuration missing'
    })
  }

  // Initialize Notion client
  const notion = new Client({
    auth: config.notionApiKey
  })

  const results: ExecutionResult[] = []

  try {
    // Process each operation
    for (const operation of body.operations) {
      try {
        let result: ExecutionResult

        if (operation.kind === 'create') {
          result = await createNotionTask(notion, config.notionDatabaseId, operation)
        } else if (operation.kind === 'update') {
          result = await updateNotionTask(notion, operation)
        } else if (operation.kind === 'status_change') {
          result = await changeNotionTaskStatus(notion, operation)
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

async function createNotionTask(
  notion: Client,
  databaseId: string,
  operation: OperationPlan
): Promise<ExecutionResult> {
  try {
    // Calculate rank with priority and due date considerations
    const calculatedRank = calculateRank(operation.fields)

    const properties: any = {
      Name: {
        title: [
          {
            text: {
              content: operation.fields.name
            }
          }
        ]
      },
      Status: {
        select: {
          name: operation.fields.status
        }
      },
      Priority: {
        select: {
          name: operation.fields.priority
        }
      },
      Rank: {
        number: calculatedRank
      },
      Notes: {
        rich_text: [
          {
            text: {
              content: operation.fields.notes
            }
          }
        ]
      }
    }

    // Add due date if provided
    if (operation.fields.due) {
      properties.Due = {
        date: {
          start: operation.fields.due
        }
      }
    }

    // Add tags if provided
    if (operation?.fields?.tags && Array.isArray(operation.fields.tags) && operation.fields.tags.length > 0) {
      properties.Tags = {
        multi_select: operation.fields.tags.map(tag => ({ name: tag }))
      }
    }

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
  operation: OperationPlan
): Promise<ExecutionResult> {
  try {
    if (!operation.taskId) {
      return {
        success: false,
        operation,
        error: 'Task ID is required for update operations'
      }
    }

    // Calculate rank with updated values
    const calculatedRank = calculateRank(operation.fields)

    const properties: any = {
      Name: {
        title: [
          {
            text: {
              content: operation.fields.name
            }
          }
        ]
      },
      Status: {
        select: {
          name: operation.fields.status
        }
      },
      Priority: {
        select: {
          name: operation.fields.priority
        }
      },
      Rank: {
        number: calculatedRank
      },
      Notes: {
        rich_text: [
          {
            text: {
              content: operation.fields.notes
            }
          }
        ]
      }
    }

    // Add due date if provided
    if (operation.fields.due) {
      properties.Due = {
        date: {
          start: operation.fields.due
        }
      }
    }

    // Add tags if provided
    if (operation?.fields?.tags && Array.isArray(operation.fields.tags) && operation.fields.tags.length > 0) {
      properties.Tags = {
        multi_select: operation.fields.tags.map(tag => ({ name: tag }))
      }
    }

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
  operation: OperationPlan
): Promise<ExecutionResult> {
  try {
    if (!operation.taskId) {
      return {
        success: false,
        operation,
        error: 'Task ID is required for status change operations'
      }
    }

    const response = await notion.pages.update({
      page_id: operation.taskId,
      properties: {
        Status: {
          select: {
            name: operation.fields.status || 'Not Started'
          }
        }
      }
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

function calculateRank(fields: Partial<NotionTask>): number {
  let baseRank = fields.rank || 50
  
  // Priority adjustments
  const priorityBonus = {
    'Urgent': 40,
    'High': 20,
    'Medium': 0,
    'Low': -20
  }
  
  baseRank += priorityBonus[fields.priority as keyof typeof priorityBonus] || 0
  
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