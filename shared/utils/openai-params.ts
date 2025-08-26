/**
 * Utility to generate correct OpenAI API parameters based on model type
 * GPT-5 models require different parameters than GPT-4 and earlier models
 */

/**
 * Creates the correct request body for OpenAI API based on model type
 */
export function createOpenAIRequestBody(
  model: string,
  messages: OpenAIRequestBody['messages'],
  options: {
    temperature?: number
    maxTokens?: number
    reasoningEffort?: 'low' | 'medium' | 'high'
    verbosity?: 'minimal' | 'normal' | 'verbose'
  } = {}
): OpenAIRequestBody {
  const {
    temperature = 0.7,
    maxTokens = 2000,
    reasoningEffort,
    verbosity
  } = options

  const isGPT5Model = model.startsWith('gpt-5')
  const requestBody: OpenAIRequestBody = {
    model,
    messages,
    temperature
  }

  if (isGPT5Model) {
    // GPT-5 models use max_completion_tokens
    requestBody.max_completion_tokens = maxTokens
    
    // Add GPT-5 specific parameters if provided
    if (reasoningEffort) {
      requestBody.reasoning_effort = reasoningEffort
    }
    if (verbosity) {
      requestBody.verbosity = verbosity
    }
  } else {
    // GPT-4 and earlier models use max_tokens
    requestBody.max_tokens = maxTokens
  }

  return requestBody
}

/**
 * Returns information about model capabilities and parameters
 */
export function getModelInfo(model: string) {
  const isGPT5Model = model.startsWith('gpt-5')
  
  if (isGPT5Model) {
    return {
      isGPT5: true,
      tokenParameter: 'max_completion_tokens',
      maxContextLength: 400000, // 400K total context
      maxOutputTokens: 128000,  // 128K reasoning & output tokens
      supportsReasoningEffort: true,
      supportsVerbosity: true,
      variants: ['gpt-5', 'gpt-5-mini', 'gpt-5-nano'],
      pricing: {
        'gpt-5': { input: 1.25, output: 10 },        // per 1M tokens
        'gpt-5-mini': { input: 0.25, output: 2 },    // per 1M tokens  
        'gpt-5-nano': { input: 0.05, output: 0.40 }  // per 1M tokens
      }
    }
  } else {
    return {
      isGPT5: false,
      tokenParameter: 'max_tokens',
      supportsReasoningEffort: false,
      supportsVerbosity: false,
      note: 'Using legacy parameter format for non-GPT-5 models'
    }
  }
}

/**
 * Validates that the model name is supported
 */
export function isValidModel(model: string): boolean {
  const supportedModels = [
    // GPT-5 models
    'gpt-5',
    'gpt-5-mini', 
    'gpt-5-nano',
    // GPT-4 models (legacy support)
    'gpt-4',
    'gpt-4-turbo',
    'gpt-4-turbo-preview',
    // GPT-3.5 models (legacy support)
    'gpt-3.5-turbo'
  ]
  
  return supportedModels.includes(model) || model.startsWith('gpt-5')
}