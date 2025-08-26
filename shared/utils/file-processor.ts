import * as Papa from 'papaparse'

export class FileProcessor {
  // Image optimization settings
  private static readonly IMAGE_MAX_WIDTH = 1200
  private static readonly IMAGE_MAX_HEIGHT = 1200
  private static readonly IMAGE_QUALITY = 0.8
  
  static async processFiles(files: File[]): Promise<ProcessedFile[]> {
    const results: ProcessedFile[] = []
    
    for (const file of files) {
      try {
        let processedFile: ProcessedFile
        
        if (file.type.startsWith('image/')) {
          processedFile = await this.processImage(file)
        } else if (file.type === 'application/pdf') {
          processedFile = await this.processPDF(file)
        } else if (file.type === 'text/csv') {
          processedFile = await this.processCSV(file)
        } else {
          throw new Error(`Unsupported file type: ${file.type}`)
        }
        
        results.push(processedFile)
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        // Include error information in the result
        results.push({
          name: file.name,
          type: file.type,
          content: `Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`,
          metadata: {
            size: file.size,
            processedAt: new Date().toISOString(),
            error: true
          }
        })
      }
    }
    
    return results
  }

  private static async processImage(file: File): Promise<ProcessedFile> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        const dataUrl = reader.result as string
        const img = new Image()
        
        img.onload = () => {
          // Create canvas for resizing and optimization
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }
          
          // Calculate new dimensions maintaining aspect ratio
          let { width, height } = img
          
          if (width > FileProcessor.IMAGE_MAX_WIDTH || height > FileProcessor.IMAGE_MAX_HEIGHT) {
            const widthRatio = FileProcessor.IMAGE_MAX_WIDTH / width
            const heightRatio = FileProcessor.IMAGE_MAX_HEIGHT / height
            const ratio = Math.min(widthRatio, heightRatio)
            
            width = Math.round(width * ratio)
            height = Math.round(height * ratio)
          }
          
          // Set canvas size
          canvas.width = width
          canvas.height = height
          
          // Draw and compress image
          ctx.drawImage(img, 0, 0, width, height)
          
          // Convert to JPEG with configured quality for better compression
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', FileProcessor.IMAGE_QUALITY)
          
          // Calculate compression ratio for logging
          const originalSize = dataUrl.length
          const optimizedSize = optimizedDataUrl.length
          const compressionRatio = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1)
          
          console.log(`Image optimized: ${file.name}`)
          console.log(`Original: ${img.width}x${img.height} (${FileProcessor.formatFileSize(file.size)})`)
          console.log(`Optimized: ${width}x${height} (reduced by ${compressionRatio}%)`)
          
          resolve({
            name: file.name,
            type: file.type,
            content: `[Image: ${file.name}] - Screenshot for task extraction analysis. Original: ${img.width}x${img.height}px, Optimized: ${width}x${height}px\n\nPlease analyze this image for task management information including task titles, due dates, status, priority, assignees, and any other structured data visible in the interface.`,
            metadata: {
              size: file.size,
              processedAt: new Date().toISOString(),
              width: img.width,
              height: img.height,
              optimizedWidth: width,
              optimizedHeight: height,
              dataUrl: optimizedDataUrl,
              compressionRatio: compressionRatio
            }
          })
        }
        
        img.onerror = () => {
          reject(new Error('Failed to load image'))
        }
        
        img.src = dataUrl
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read image file'))
      }
      
      reader.readAsDataURL(file)
    })
  }

  private static async processPDF(file: File): Promise<ProcessedFile> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async () => {
        try {
          // For now, we'll provide metadata about the PDF
          // In a full implementation, you'd use a PDF parsing library like PDF.js
          resolve({
            name: file.name,
            type: file.type,
            content: `[PDF Document: ${file.name}] - This PDF document will be processed by the LLM to extract task-relevant information. Size: ${this.formatFileSize(file.size)}`,
            metadata: {
              size: file.size,
              processedAt: new Date().toISOString(),
              pages: 'Unknown', // Would be determined by PDF parser
              note: 'PDF parsing requires additional implementation with PDF.js or similar library'
            }
          })
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read PDF file'))
      }
      
      reader.readAsArrayBuffer(file)
    })
  }

  private static async processCSV(file: File): Promise<ProcessedFile> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        const text = reader.result as string
        
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`))
              return
            }
            
            const data = results.data as Record<string, string>[]
            const headers = Object.keys(data[0] || {})
            const rowCount = data.length
            
            // Create a summary of the CSV content
            let content = `[CSV Data: ${file.name}]\n`
            content += `Rows: ${rowCount}, Columns: ${headers.length}\n`
            content += `Headers: ${headers.join(', ')}\n\n`
            
            // Include first few rows as sample
            const sampleSize = Math.min(5, rowCount)
            if (sampleSize > 0) {
              content += `Sample data (first ${sampleSize} rows):\n`
              for (let i = 0; i < sampleSize; i++) {
                const row = data[i]
                content += `Row ${i + 1}: ${JSON.stringify(row)}\n`
              }
            }
            
            resolve({
              name: file.name,
              type: file.type,
              content,
              metadata: {
                size: file.size,
                processedAt: new Date().toISOString(),
                rowCount,
                columnCount: headers.length,
                headers,
                sampleData: data.slice(0, 3) // Store first 3 rows for LLM context
              }
            })
          },
          error: (error: any) => {
            reject(new Error(`CSV parsing failed: ${error.message}`))
          }
        })
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read CSV file'))
      }
      
      reader.readAsText(file)
    })
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  static createLLMContext(processedFiles: ProcessedFile[]): string {
    if (processedFiles.length === 0) {
      return ''
    }
    
    let context = '\n\n=== ATTACHED FILES CONTEXT ===\n'
    
    for (const file of processedFiles) {
      context += `\n--- ${file.name} (${file.type}) ---\n`
      context += file.content
      
      if (file.metadata.error) {
        context += '\n[Note: This file could not be processed properly and should be handled manually]'
      }
      
      context += '\n'
    }
    
    context += '\n=== END FILES CONTEXT ===\n'
    context += '\nPlease analyze the above file contents and incorporate relevant information into your task generation plan.\n'
    
    return context
  }
}

// Utility function to get file icon based on type
export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) {
    return '🖼️'
  } else if (mimeType === 'application/pdf') {
    return '📄'
  } else if (mimeType === 'text/csv') {
    return '📊'
  }
  return '📎'
}

// Utility function to validate file before processing
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'text/csv']
  const maxSize = 10 * 1024 * 1024 // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not supported. Please use JPG, PNG, PDF, or CSV files.`
    }
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size ${FileProcessor.formatFileSize(file.size)} exceeds the 10MB limit.`
    }
  }
  
  return { valid: true }
}