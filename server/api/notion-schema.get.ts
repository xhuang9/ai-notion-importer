import { Client } from '@notionhq/client'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

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

  try {
    // Get database schema
    const database = await notion.databases.retrieve({
      database_id: config.notionDatabaseId
    })

    // Extract field information
    const fields: NotionFieldSchema[] = []
    
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

      // Add field descriptions based on type
      switch (property.type) {
        case 'title':
          field.description = 'Main title/name of the task'
          break
        case 'select':
          field.description = `Single selection field with options: ${field.options?.join(', ') || 'none'}`
          break
        case 'multi_select':
          field.description = `Multiple selection field with options: ${field.options?.join(', ') || 'none'}`
          break
        case 'date':
          field.description = 'Date field (YYYY-MM-DD format)'
          break
        case 'number':
          field.description = 'Numeric field for rankings, scores, etc.'
          break
        case 'rich_text':
          field.description = 'Text field for notes, descriptions, etc.'
          break
        default:
          field.description = `${property.type} field`
      }

      fields.push(field)
    }

    // Get sample data to understand usage patterns
    const pagesResponse = await notion.databases.query({
      database_id: config.notionDatabaseId,
      page_size: 10 // Get first 10 pages for sampling
    })

    // Extract sample values to understand data patterns
    const sampleData = pagesResponse.results.map(page => {
      const sample: any = {}
      
      if ('properties' in page) {
        for (const [propName, propValue] of Object.entries(page.properties)) {
          if (propValue.type === 'title' && 'title' in propValue && propValue.title?.[0]) {
            sample[propName] = propValue.title[0].plain_text
          } else if (propValue.type === 'select' && 'select' in propValue && propValue.select) {
            sample[propName] = propValue.select.name
          } else if (propValue.type === 'multi_select' && 'multi_select' in propValue && propValue.multi_select) {
            sample[propName] = propValue.multi_select.map((s: any) => s.name)
          } else if (propValue.type === 'date' && 'date' in propValue && propValue.date) {
            sample[propName] = propValue.date.start
          } else if (propValue.type === 'number' && 'number' in propValue && propValue.number) {
            sample[propName] = propValue.number
          } else if (propValue.type === 'rich_text' && 'rich_text' in propValue && propValue.rich_text?.[0]) {
            sample[propName] = propValue.rich_text[0].plain_text
          }
        }
      }
      
      return sample
    }).filter(sample => Object.keys(sample).length > 0) // Filter out empty samples

    const schema: NotionDatabaseSchema = {
      title: 'title' in database && database.title?.[0]?.plain_text || 'Notion Database',
      fields,
      totalPages: pagesResponse.results.length,
      sampleData: sampleData.slice(0, 3) // Only include first 3 samples
    }

    return {
      success: true,
      schema,
      retrievedAt: new Date().toISOString()
    }

  } catch (error) {
    console.error('Notion schema retrieval error:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to retrieve Notion database schema'
    })
  }
})