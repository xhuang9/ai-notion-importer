export interface FormSubmission {
  prompt: string
  files: File[]
  systemPrompts: SystemPrompt[]
}

export interface PlanSession {
  id: string
  operations: OperationPlan[]
  createdAt: string
  originalPrompt: string
  files: FileInfo[]
  reasoning?: string
  warnings?: string[]
}

export interface LLMResponse {
  plan: OperationPlan[]
  reasoning: string
  warnings: string[]
}