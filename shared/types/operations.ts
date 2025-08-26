export interface OperationPlan {
  id: string
  kind: 'create' | 'update' | 'status_change'
  taskId?: string
  fields: Partial<NotionTask>
  reason: string
  confidence: number
  warnings: string[]
  approved: boolean
  edited: boolean
}