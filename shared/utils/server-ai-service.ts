import OpenAI from 'openai/index.mjs'

interface AIServiceConfig {
  apiKey: string
  defaultModel?: string
}

interface AIRequestOptions {
  model?: string
  max_completion_tokens?: number
  temperature?: number
}

export class AIService {
  private openai: OpenAI
  private defaultModel: string

  constructor(config: AIServiceConfig) {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required')
    }

    this.openai = new OpenAI({
      apiKey: config.apiKey
    })
    
    this.defaultModel = config.defaultModel || 'gpt-5-mini'
  }

  /**
   * Make a request to OpenAI with automatic fallback for GPT-5 models
   */
  async makeRequest(
    messages: Array<{ role: 'system' | 'user' | 'assistant', content: string | Array<any> }>,
    options: AIRequestOptions = {}
  ): Promise<string> {
    const modelToUse = options.model || this.defaultModel
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: modelToUse,
        messages,
        max_completion_tokens: options.max_completion_tokens || 6000,
        temperature: this.getTemperature(modelToUse, options.temperature)
      })

      // Log the response for debugging
      console.log('OpenAI API Response:', {
        model: completion.model,
        usage: completion.usage,
        choices_count: completion.choices?.length || 0
      })

      if (!completion.choices || completion.choices.length === 0) {
        throw new Error('OpenAI API returned no choices in response')
      }

      const content = completion.choices[0]?.message?.content
      
      if (!content || content.trim() === '') {
        const finishReason = completion.choices[0]?.finish_reason
        console.error('Empty content from OpenAI:', {
          choice: completion.choices[0],
          finish_reason: finishReason
        })
        
        if (finishReason === 'length') {
          throw new Error(`OpenAI response was cut off due to token limit. Consider increasing max_completion_tokens. Current usage: ${completion.usage?.completion_tokens || 'unknown'} tokens`)
        } else {
          throw new Error(`OpenAI returned empty content. Finish reason: ${finishReason || 'unknown'}`)
        }
      }
      
      return content
    } catch (error: any) {
      // If GPT-5 model is not available, fallback to GPT-4o-mini
      if (error.code === 'model_not_found' && modelToUse.startsWith('gpt-5')) {
        console.warn(`GPT-5 model ${modelToUse} not yet available, falling back to gpt-4o-mini`)
        
        const fallbackCompletion = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          max_completion_tokens: options.max_completion_tokens || 6000,
          temperature: options.temperature || 0.7
        })

        console.log('Fallback OpenAI API Response:', {
          model: fallbackCompletion.model,
          usage: fallbackCompletion.usage,
          choices_count: fallbackCompletion.choices?.length || 0
        })

        if (!fallbackCompletion.choices || fallbackCompletion.choices.length === 0) {
          throw new Error('OpenAI fallback API returned no choices in response')
        }

        const content = fallbackCompletion.choices[0]?.message?.content
        
        if (!content || content.trim() === '') {
          const finishReason = fallbackCompletion.choices[0]?.finish_reason
          console.error('Empty content from fallback OpenAI:', {
            choice: fallbackCompletion.choices[0],
            finish_reason: finishReason
          })
          
          if (finishReason === 'length') {
            throw new Error(`OpenAI fallback response was cut off due to token limit. Consider increasing max_completion_tokens. Current usage: ${fallbackCompletion.usage?.completion_tokens || 'unknown'} tokens`)
          } else {
            throw new Error(`OpenAI fallback returned empty content. Finish reason: ${finishReason || 'unknown'}`)
          }
        }
        
        return content
      } else {
        // Re-throw other errors with enhanced information
        throw new Error(`OpenAI API error: ${error.message || error}`)
      }
    }
  }

  /**
   * Get appropriate temperature based on model
   */
  private getTemperature(model: string, requestedTemperature?: number): number {
    // GPT-5 models only support temperature=1
    if (model.startsWith('gpt-5')) {
      return 1
    }
    
    // Use requested temperature or default
    return requestedTemperature || 0.7
  }

  /**
   * Check if a model is a GPT-5 variant
   */
  isGPT5Model(model: string): boolean {
    return model.startsWith('gpt-5')
  }

  /**
   * Get available models list (for future model switching UI)
   */
  getAvailableModels(): string[] {
    return [
      'gpt-5',
      'gpt-5-mini', 
      'gpt-5-nano',
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-3.5-turbo'
    ]
  }
}