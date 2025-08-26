export interface SystemPrompt {
  id: string
  name: string
  content: string
  active: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface GeneratedSystemPrompt {
  name: string
  content: string
  category: 'database-structure' | 'field-guidance' | 'data-patterns' | 'validation-rules'
}