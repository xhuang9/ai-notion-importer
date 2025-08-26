/**
 * Main schema prompt generation utilities - functional approach
 * Coordinates all the individual prompt generators
 */

/**
 * Generate all system prompts from a Notion database schema
 */
export function generateSystemPromptsFromSchema(schema: NotionDatabaseSchema): GeneratedSystemPrompt[] {
  const prompts: GeneratedSystemPrompt[] = []

  // 1. Database Structure Overview
  prompts.push(generateDatabaseStructurePrompt(schema))

  // 2. Field-specific guidance
  prompts.push(...generateFieldGuidancePrompts(schema))

  // 3. Data patterns and examples (if sample data available)
  if (schema.sampleData && schema.sampleData.length > 0) {
    prompts.push(generateDataPatternsPrompt(schema))
  }

  // 4. Validation rules
  prompts.push(generateValidationRulesPrompt(schema))

  // 5. API Query generation guide
  prompts.push(generateAPIQueryPrompt(schema))

  return prompts
}

/**
 * Convert generated prompts to system prompts for storage
 */
export function convertToSystemPrompts(generatedPrompts: GeneratedSystemPrompt[]): SystemPrompt[] {
  const now = new Date().toISOString()
  
  return generatedPrompts.map((prompt, index) => ({
    id: crypto.randomUUID(),
    name: prompt.name,
    content: prompt.content,
    active: true,
    order: index,
    createdAt: now,
    updatedAt: now
  }))
}