/**
 * Shared state management for SystemPrompts and its sub-components
 * Centralizes system prompts operations and modal state
 */

export const useSystemPromptsState = () => {
  // Core system prompts functionality from useSystemPrompts
  const {
    getSystemPrompts,
    addSystemPrompt,
    updateSystemPrompt,
    deleteSystemPrompt,
    toggleSystemPrompt,
    exportSystemPrompts,
    importSystemPrompts
  } = useSystemPrompts()

  // Notion schema functionality 
  const {
    isLoading: isLoadingSchema,
    error: schemaError,
    fetchSchema,
    generateSystemPrompts: generateFromSchema,
    getSchemaSummary,
    getFieldDetails,
    needsRefresh
  } = useNotionSchema()

  // Local state for UI
  const systemPrompts = ref<SystemPrompt[]>([])
  const showModal = ref(false)
  const showImportModal = ref(false)
  const showSchemaModal = ref(false)
  const editingPrompt = ref<SystemPrompt | null>(null)
  const importData = ref('')
  const importError = ref('')

  // Schema generation state
  const isGeneratingFromNotion = ref(false)
  const generatedPrompts = ref<GeneratedSystemPrompt[]>([])
  const selectedPrompts = ref<number[]>([])

  // Form state
  const formData = ref({
    name: '',
    content: '',
    active: true
  })

  // Computed properties
  const schemaSummary = getSchemaSummary
  const fieldDetails = getFieldDetails

  // Actions
  const loadPrompts = () => {
    systemPrompts.value = getSystemPrompts().sort((a, b) => a.order - b.order)
  }

  const openCreateModal = () => {
    editingPrompt.value = null
    formData.value = {
      name: '',
      content: '',
      active: true
    }
    showModal.value = true
  }

  const openEditModal = (prompt: SystemPrompt) => {
    editingPrompt.value = prompt
    formData.value = {
      name: prompt.name,
      content: prompt.content,
      active: prompt.active
    }
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    editingPrompt.value = null
  }

  const savePrompt = () => {
    if (editingPrompt.value) {
      updateSystemPrompt(editingPrompt.value.id, formData.value)
    } else {
      addSystemPrompt(formData.value.name, formData.value.content)
    }
    
    closeModal()
    loadPrompts()
  }

  const togglePrompt = (id: string) => {
    toggleSystemPrompt(id)
    loadPrompts()
  }

  const deletePrompt = (id: string) => {
    if (confirm('Are you sure you want to delete this system prompt?')) {
      deleteSystemPrompt(id)
      loadPrompts()
    }
  }

  const handleExport = () => {
    const data = exportSystemPrompts()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `system-prompts-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const openImportModal = () => {
    importData.value = ''
    importError.value = ''
    showImportModal.value = true
  }

  const closeImportModal = () => {
    showImportModal.value = false
    importData.value = ''
    importError.value = ''
  }

  const performImport = () => {
    importError.value = ''
    
    if (!importData.value.trim()) {
      importError.value = 'Please provide JSON data to import'
      return
    }
    
    const success = importSystemPrompts(importData.value)
    
    if (success) {
      closeImportModal()
      loadPrompts()
    } else {
      importError.value = 'Invalid JSON format or data structure'
    }
  }

  const generateFromNotionSchema = async () => {
    isGeneratingFromNotion.value = true
    
    try {
      await fetchSchema()
      const generated = generateFromSchema()
      
      generatedPrompts.value = generated
      selectedPrompts.value = generated.map((_, index) => index) // Select all by default
      showSchemaModal.value = true
    } catch (error) {
      console.error('Schema generation error:', error)
      alert('Failed to generate prompts from Notion schema. Please check your configuration.')
    } finally {
      isGeneratingFromNotion.value = false
    }
  }

  const closeSchemaModal = () => {
    showSchemaModal.value = false
    generatedPrompts.value = []
    selectedPrompts.value = []
  }

  const addSelectedPrompts = () => {
    const promptsToAdd = selectedPrompts.value
      .map(index => generatedPrompts.value[index])
      .filter(prompt => prompt !== undefined)
    const systemPromptsToAdd = convertToSystemPrompts(promptsToAdd)
    
    // Add each prompt individually
    systemPromptsToAdd.forEach((prompt: SystemPrompt) => {
      addSystemPrompt(prompt.name, prompt.content)
    })
    
    closeSchemaModal()
    loadPrompts()
    
    // Show success message
    alert(`Successfully added ${systemPromptsToAdd.length} system prompts from your Notion database!`)
  }

  return {
    // State
    systemPrompts: readonly(systemPrompts),
    showModal,
    showImportModal,
    showSchemaModal,
    editingPrompt: readonly(editingPrompt),
    importData,
    importError,
    isGeneratingFromNotion: readonly(isGeneratingFromNotion),
    generatedPrompts: readonly(generatedPrompts),
    selectedPrompts,
    formData,

    // Schema state
    isLoadingSchema,
    schemaError,
    schemaSummary,
    fieldDetails,
    needsRefresh,

    // Actions
    loadPrompts,
    openCreateModal,
    openEditModal,
    closeModal,
    savePrompt,
    togglePrompt,
    deletePrompt,
    handleExport,
    openImportModal,
    closeImportModal,
    performImport,
    generateFromNotionSchema,
    closeSchemaModal,
    addSelectedPrompts
  }
}