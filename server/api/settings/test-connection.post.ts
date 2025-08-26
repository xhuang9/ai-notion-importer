import { Client } from '@notionhq/client'

interface RequestBody {
  OPENAI_API_KEY: string
  NOTION_API_KEY: string
  NOTION_DATABASE_ID: string
  LLM_MODEL: string
}

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    })
  }

  const body = await readBody(event) as RequestBody
  const config = useRuntimeConfig()
  
  // Use the same config logic as the real application
  // Create a mock event with settings in headers to simulate how real requests work
  const mockEvent = {
    ...event,
    node: {
      ...event.node,
      req: {
        ...event.node.req,
        headers: {
          ...event.node.req.headers,
          'x-localStorage-settings': JSON.stringify({
            OPENAI_API_KEY: body.OPENAI_API_KEY === 'env' ? config?.private?.openaiApiKey : body.OPENAI_API_KEY,
            NOTION_API_KEY: body.NOTION_API_KEY === 'env' ? config?.private?.notionApiKey : body.NOTION_API_KEY,
            NOTION_DATABASE_ID: body.NOTION_DATABASE_ID === 'env' ? config?.private?.notionDatabaseId : body.NOTION_DATABASE_ID,
            LLM_MODEL: body.LLM_MODEL === 'env' ? config?.private?.llmModel : body.LLM_MODEL,
            OPENAI_MAX_COMPLETION_TOKENS: 6000
          })
        }
      }
    }
  }
  
  // Use the same getMergedConfig function as the real application
  const actualConfig = getMergedConfig(mockEvent)

  if (!actualConfig.OPENAI_API_KEY || !actualConfig.NOTION_API_KEY || !actualConfig.NOTION_DATABASE_ID) {
    throw createError({
      statusCode: 400,
      statusMessage: 'All API keys and database ID are required for testing'
    })
  }

  const results: Array<{ service: string; success: boolean; message: string }> = []

  // Test OpenAI connection
  try {
    const aiService = new AIService({
      apiKey: actualConfig.OPENAI_API_KEY,
      defaultModel: actualConfig.LLM_MODEL || 'gpt-5-mini'
    })

    // Simple test message
    const testMessages = [{
      role: 'user' as const,
      content: CONNECTION_TEST_MESSAGE
    }]

    await aiService.makeRequest(testMessages, { max_completion_tokens: 200 })
    
    results.push({
      service: 'OpenAI',
      success: true,
      message: `Connected successfully with model ${actualConfig.LLM_MODEL || 'gpt-5-mini'}`
    })
  } catch (error: any) {
    results.push({
      service: 'OpenAI',
      success: false,
      message: `Connection failed: ${error.message || 'Unknown error'}`
    })
  }

  // Test Notion connection
  try {
    const notion = new Client({
      auth: actualConfig.NOTION_API_KEY
    })

    // Test by trying to retrieve the database
    const database = await notion.databases.retrieve({
      database_id: actualConfig.NOTION_DATABASE_ID
    })

    // Get database title - it could be in title property or properties
    const databaseTitle = (database as any).title?.[0]?.plain_text || 
                         (database as any).properties?.Name?.title || 
                         'Database'
    
    results.push({
      service: 'Notion',
      success: true,
      message: `Connected to database "${databaseTitle}" successfully`
    })
  } catch (error: any) {
    let errorMessage = 'Unknown error'
    
    if (error.code === 'object_not_found') {
      errorMessage = 'Database not found. Please check the database ID and ensure the integration has access.'
    } else if (error.code === 'unauthorized') {
      errorMessage = 'Unauthorized. Please check the API key and integration permissions.'
    } else if (error.message) {
      errorMessage = error.message
    }

    results.push({
      service: 'Notion',
      success: false,
      message: `Connection failed: ${errorMessage}`
    })
  }

  const allSuccessful = results.every(r => r.success)
  const failedServices = results.filter(r => !r.success).map(r => r.service)

  return {
    success: allSuccessful,
    message: allSuccessful 
      ? 'All connections verified successfully' 
      : `Connection failed for: ${failedServices.join(', ')}`,
    results
  }
})