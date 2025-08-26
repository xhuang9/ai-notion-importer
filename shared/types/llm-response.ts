export interface LLMPromptResponse {
  success: boolean
  updatedOperations: OperationPlan[]
  reasoning: string
  warnings: string[]
  metadata?: {
    model?: string
    generatedAt?: string
    [key: string]: any
  }
}

export interface LLMPromptRequest {
  prompt: string
  operations: OperationPlan[]
  preserveApproved?: boolean
  addWarnings?: boolean
}