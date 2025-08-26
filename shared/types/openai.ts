export interface OpenAIRequestBody {
  model: string
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  temperature?: number
  max_tokens?: number
  max_completion_tokens?: number
  reasoning_effort?: 'low' | 'medium' | 'high'
  verbosity?: 'minimal' | 'normal' | 'verbose'
}