export const useNotionSchema = () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const schema = ref<NotionDatabaseSchema | null>(null)
  const lastFetched = ref<string | null>(null)

  /**
   * Fetches the Notion database schema
   */
  const fetchSchema = async (): Promise<NotionDatabaseSchema | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetchWithSettings('/api/notion-schema')
      
      if (response.success) {
        schema.value = response.schema
        lastFetched.value = response.retrievedAt
        return response.schema
      } else {
        throw new Error('Failed to fetch schema')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      error.value = errorMessage
      console.error('Schema fetch error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Generates system prompts based on the current schema
   */
  const generateSystemPrompts = (): GeneratedSystemPrompt[] => {
    if (!schema.value) {
      throw new Error('No schema available. Please fetch schema first.')
    }
    
    return generateSystemPromptsFromSchema(schema.value)
  }

  /**
   * Gets schema summary for display
   */
  const getSchemaSummary = computed(() => {
    if (!schema.value) return null

    const fieldsByType = schema.value.fields.reduce((acc, field) => {
      acc[field.type] = (acc[field.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const selectFields = schema.value.fields.filter(f => 
      (f.type === 'select' || f.type === 'multi_select') && f.options
    )

    return {
      title: schema.value.title,
      totalFields: schema.value.fields.length,
      fieldsByType,
      selectFieldsCount: selectFields.length,
      totalOptionsCount: selectFields.reduce((sum, field) => sum + (field.options?.length || 0), 0),
      hasSampleData: schema.value.sampleData && schema.value.sampleData.length > 0,
      sampleDataCount: schema.value.sampleData?.length || 0
    }
  })

  /**
   * Gets detailed field information
   */
  const getFieldDetails = computed(() => {
    if (!schema.value) return []

    return schema.value.fields.map(field => ({
      name: field.name,
      type: field.type,
      description: field.description,
      hasOptions: !!field.options,
      optionsCount: field.options?.length || 0,
      options: field.options || []
    }))
  })

  /**
   * Checks if schema needs refresh (older than 5 minutes)
   */
  const needsRefresh = computed(() => {
    if (!lastFetched.value) return true
    
    const fetchTime = new Date(lastFetched.value).getTime()
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000
    
    return (now - fetchTime) > fiveMinutes
  })

  /**
   * Auto-refresh schema if needed
   */
  const autoRefresh = async () => {
    if (needsRefresh.value && !isLoading.value) {
      await fetchSchema()
    }
  }

  return {
    // State
    isLoading: readonly(isLoading),
    error: readonly(error),
    schema: readonly(schema),
    lastFetched: readonly(lastFetched),
    
    // Actions
    fetchSchema,
    generateSystemPrompts,
    autoRefresh,
    
    // Computed
    getSchemaSummary,
    getFieldDetails,
    needsRefresh
  }
}