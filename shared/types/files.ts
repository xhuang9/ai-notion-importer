export interface FileInfo {
  name: string
  type: string
  size: number
  content?: string
  dataUrl?: string
}

export interface ProcessedFile {
  name: string
  type: string
  content: string
  metadata: {
    size: number
    processedAt: string
    [key: string]: any
  }
}