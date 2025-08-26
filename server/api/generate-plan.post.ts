interface RequestBody {
  prompt: string
  files: Array<{
    name: string
    type: string
    content: string
    size: number
  }>
  systemPrompts: SystemPrompt[]
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

  if (!body.prompt?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Prompt is required'
    })
  }

  if (!validation.isValid) {
    throw createError({
      statusCode: 500,
      statusMessage: `Missing required configuration: ${validation.missing.join(', ')}`
    })
  }

  console.log('Generate plan request:', {
    promptLength: body.prompt?.length || 0,
    filesCount: body.files?.length || 0,
    systemPromptsCount: body.systemPrompts?.length || 0,
    model: config.LLM_MODEL || 'gpt-5-mini',
    maxCompletionTokens: config.OPENAI_MAX_COMPLETION_TOKENS || 6000
  })

  try {
    // Build system prompt with database structure
    const systemPrompt = buildPlanGenerationPrompt(body.systemPrompts || [])

    // Build user prompt with file attachments
    const userPrompt = buildUserPromptWithFiles(body.prompt, body.files)

    // Initialize AI service
    const aiService = new AIService({
      apiKey: config.OPENAI_API_KEY!,
      defaultModel: config.LLM_MODEL || 'gpt-5-mini'
    })

    // Check if we have images for vision analysis
    const hasImages = body.files?.some(file => 
      file.type.startsWith('image/')
    )

    // Prepare OpenAI messages
    const messages: Array<{
      role: 'system' | 'user'
      content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>
    }> = [
      {
        role: 'system' as const,
        content: systemPrompt
      }
    ]

    if (hasImages) {
      // Create vision message with images
      const userContent = []
      
      // Add text content
      userContent.push({
        type: 'text',
        text: userPrompt
      })
      
      // Add images
      body.files?.forEach(file => {
        if (file.type.startsWith('image/')) {
          // The image data should be in the content field as a data URL
          if (file.content && file.content.startsWith('data:image/')) {
            userContent.push({
              type: 'image_url',
              image_url: {
                url: file.content
              }
            })
          }
        }
      })
      
      messages.push({
        role: 'user' as const,
        content: userContent
      })
    } else {
      // Standard text-only message
      messages.push({
        role: 'user' as const,
        content: userPrompt
      })
    }

    // Call OpenAI API with error handling and fallback
    const content = await aiService.makeRequest(messages, {
      max_completion_tokens: config.OPENAI_MAX_COMPLETION_TOKENS || 6000
    })

    // Parse the JSON response
    let parsedResponse: {
      plan: OperationPlan[]
      reasoning: string
      warnings: string[]
    }

    try {
      parsedResponse = JSON.parse(content)
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

    // Validate and enhance the response
    if (!parsedResponse.plan || !Array.isArray(parsedResponse.plan)) {
      throw new Error('Invalid plan format from LLM')
    }

    // Ensure basic data consistency without hardcoding fields
    const enhancedPlan = parsedResponse.plan.map((operation, index) => ({
      id: operation.id || `op-${Date.now()}-${index}`,
      kind: operation.kind || 'create',
      taskId: operation.taskId,
      fields: operation.fields || {}, // Keep whatever fields the LLM provided based on system prompts
      reason: operation.reason || 'Generated from user request',
      confidence: Math.min(100, Math.max(0, operation.confidence || 80)),
      warnings: Array.isArray(operation.warnings) ? operation.warnings : [],
      approved: false,
      edited: false
    }))

    return {
      success: true,
      plan: enhancedPlan,
      reasoning: parsedResponse.reasoning || 'Plan generated successfully',
      warnings: Array.isArray(parsedResponse.warnings) ? parsedResponse.warnings : [],
      metadata: {
        model: config.LLM_MODEL,
        generatedAt: new Date().toISOString(),
        fileCount: body.files?.length || 0,
        systemPromptCount: body.systemPrompts?.length || 0
      }
    }

  } catch (error: any) {
    console.error('Plan generation error:', error)
    
    // Provide more detailed error information
    let errorMessage = 'Failed to generate plan'
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