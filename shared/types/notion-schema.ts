export interface NotionFieldSchema {
  name: string
  type: string
  options?: string[]
  description?: string
}

export interface NotionDatabaseSchema {
  title: string
  fields: NotionFieldSchema[]
  totalPages: number
  sampleData?: any[]
}