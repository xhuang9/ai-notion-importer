/**
 * Generate data patterns system prompts from Notion schema sample data
 */

export function generateDataPatternsPrompt(schema: NotionDatabaseSchema): GeneratedSystemPrompt {
  if (!schema.sampleData || schema.sampleData.length === 0) {
    throw new Error('No sample data available for pattern generation')
  }

  // Analyze sample data for patterns
  const patterns = analyzeSampleDataPatterns(schema.sampleData, schema.fields)
  
  let content = `# Data Patterns Analysis for "${schema.title}"

Based on analysis of ${schema.sampleData.length} existing records, here are the observed patterns:

## Field Usage Patterns
${patterns.fieldUsage}

## Value Distribution Patterns  
${patterns.valueDistribution}

## Naming Conventions
${patterns.namingConventions}

## Relationship Patterns
${patterns.relationships}

## Recommendations for New Operations
${patterns.recommendations}

**Important:** These patterns are based on existing data and should inform but not restrict your operations. Always follow the explicit field rules and validation requirements over inferred patterns.`

  return {
    name: 'Data Patterns Analysis',
    content,
    category: 'data-patterns'
  }
}

function analyzeSampleDataPatterns(sampleData: any[], fields: NotionFieldSchema[]): {
  fieldUsage: string
  valueDistribution: string
  namingConventions: string
  relationships: string
  recommendations: string
} {
  const totalRecords = sampleData.length
  
  // Analyze field usage frequency
  const fieldUsageStats = fields.map(field => {
    const usageCount = sampleData.filter(record => {
      const value = record[field.name]
      return value !== null && value !== undefined && value !== ''
    }).length
    
    const percentage = Math.round((usageCount / totalRecords) * 100)
    return `- **${field.name}**: Used in ${usageCount}/${totalRecords} records (${percentage}%)`
  }).join('\n')

  // Analyze value distributions for select fields
  const selectFields = fields.filter(f => f.type === 'select' || f.type === 'multi_select')
  const valueDistribution = selectFields.map(field => {
    const valueCounts: Record<string, number> = {}
    
    sampleData.forEach(record => {
      const value = record[field.name]
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1)
        } else {
          valueCounts[value] = (valueCounts[value] || 0) + 1
        }
      }
    })
    
    const distributions = Object.entries(valueCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([value, count]) => `  - "${value}": ${count} times`)
      .join('\n')
    
    return `**${field.name}** distribution:\n${distributions}`
  }).join('\n\n')

  // Analyze naming conventions
  const titleField = fields.find(f => f.type === 'title')
  let namingConventions = 'No clear naming patterns identified.'
  
  if (titleField) {
    const titles = sampleData
      .map(record => record[titleField.name])
      .filter(title => title && typeof title === 'string')
    
    if (titles.length > 0) {
      const avgLength = Math.round(titles.reduce((sum, title) => sum + title.length, 0) / titles.length)
      const hasNumbers = titles.some(title => /\d/.test(title))
      const hasSpecialChars = titles.some(title => /[^\w\s]/.test(title))
      
      namingConventions = `Observed naming patterns for ${titleField.name}:
- Average length: ${avgLength} characters
- Contains numbers: ${hasNumbers ? 'Yes' : 'No'}
- Contains special characters: ${hasSpecialChars ? 'Yes' : 'No'}
- Sample titles: ${titles.slice(0, 3).map(t => `"${t}"`).join(', ')}`
    }
  }

  return {
    fieldUsage: fieldUsageStats,
    valueDistribution: valueDistribution || 'No select fields to analyze.',
    namingConventions,
    relationships: 'Relationship analysis requires more complex data modeling.',
    recommendations: `Based on the patterns above:
- Focus on commonly used fields (>70% usage rate) for required operations
- Follow established naming conventions when creating new records
- Use the most frequent select values as defaults where appropriate
- Consider field usage patterns when setting confidence levels`
  }
}