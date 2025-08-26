interface RequestBody {
  operations: OperationPlan[]
  userPrompt: string
  systemPrompts: Array<{
    id: string
    name: string
    content: string
    active: boolean
  }>
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

  if (!body.userPrompt?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User prompt is required'
    })
  }

  if (!body.operations || body.operations.length === 0) {
    throw createError({
      statusCode: 400, 
      statusMessage: 'Operations array is required'
    })
  }

  if (!validation.isValid) {
    throw createError({
      statusCode: 500,
      statusMessage: `Missing required configuration: ${validation.missing.join(', ')}`
    })
  }

  console.log('Update operations request:', {
    userPromptLength: body.userPrompt?.length || 0,
    operationsCount: body.operations?.length || 0,
    systemPromptsCount: body.systemPrompts?.length || 0,
    model: config.LLM_MODEL || 'gpt-5-mini'
  })

  try {
    // Build system prompt with database structure
    const systemPrompt = buildOperationUpdatePrompt(body.systemPrompts || [])

    // Build user prompt with operations context
    const userPrompt = buildOperationUpdateUserPrompt(body.userPrompt, body.operations)

    // Initialize AI service
    const aiService = new AIService({
      apiKey: config.OPENAI_API_KEY!,
      defaultModel: config.LLM_MODEL || 'gpt-5-mini'
    })

    // Prepare messages
    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt
      },
      {
        role: 'user' as const,
        content: userPrompt
      }
    ]

    // Call OpenAI API
    const content = await aiService.makeRequest(messages, {
      max_completion_tokens: config.OPENAI_MAX_COMPLETION_TOKENS || 6000
    })

    // Parse the JSON response
    let parsedResponse: {
      operations: OperationPlan[]
      reasoning: string
      warnings: string[]
    }

    try {
      // Clean the response to extract JSON
      let jsonStr = content.trim()
      
      // Remove markdown formatting if present
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      parsedResponse = JSON.parse(jsonStr)
    } catch (parseError) {
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0])
        } catch {
          throw new Error('Failed to parse LLM response as JSON')
        }
      } else {
        throw new Error('No valid JSON found in LLM response')
      }
    }

    // Validate response structure
    if (!parsedResponse.operations || !Array.isArray(parsedResponse.operations)) {
      throw new Error('Invalid operations format from LLM')
    }

    // Ensure all operations have required fields
    const enhancedOperations = parsedResponse.operations.map((operation, index) => ({
      id: operation.id || `updated-${Date.now()}-${index}`,
      kind: operation.kind || 'create',
      taskId: operation.taskId,
      fields: operation.fields || {},
      reason: operation.reason || 'Modified by user request',
      confidence: Math.min(100, Math.max(0, operation.confidence || 80)),
      warnings: Array.isArray(operation.warnings) ? operation.warnings : [],
      approved: operation.approved || false,
      edited: operation.edited || true
    }))

    return {
      success: true,
      operations: enhancedOperations,
      reasoning: parsedResponse.reasoning || 'Operations updated successfully',
      warnings: Array.isArray(parsedResponse.warnings) ? parsedResponse.warnings : [],
      metadata: {
        model: config.LLM_MODEL,
        modifiedAt: new Date().toISOString(),
        operationsCount: enhancedOperations.length,
        systemPromptCount: body.systemPrompts?.length || 0
      }
    }

  } catch (error: any) {
    console.error('Operation update error:', error)
    
    // Provide detailed error information
    let errorMessage = 'Failed to update operations'
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }
    
    // Log detailed error for debugging
    console.error('Detailed error:', {
      message: errorMessage,
      stack: error?.stack,
      code: error?.code,
      type: error?.type
    })
    
    throw createError({
      statusCode: 500,
      statusMessage: errorMessage
    })
  }
})