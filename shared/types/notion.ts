export interface NotionTask {
  id?: string
  name: string
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold'
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  due?: string | null
  tags: string[]
  rank: number
  notes: string
}

export interface NotionField {
  name: string
  status: string
  priority: string
  due: string | null
  tags: string[]
  rank: number
  notes: string
}