<template>
  <div class="card">
    <SystemPromptsHeader
      :is-generating-from-notion="isGeneratingFromNotion"
      @generate-from-notion="generateFromNotionSchema"
      @import="openImportModal"
      @export="exportPrompts"
      @create-new="openCreateModal"
    />

    <SystemPromptsNotionInfo
      :schema-summary="schemaSummary"
      :needs-refresh="needsRefresh"
    />

    <SystemPromptsEmptyState
      v-if="systemPrompts.length === 0"
      @generate-from-notion="generateFromNotionSchema"
    />

    <div v-else class="space-y-4">
      <SystemPromptsPromptCard
        v-for="prompt in systemPrompts" 
        :key="prompt.id"
        :prompt="prompt"
        @toggle="togglePrompt"
        @edit="openEditModal"
        @delete="deletePrompt"
      />
    </div>

    <SystemPromptsCreateModal
      :is-visible="showModal"
      :editing-prompt="editingPrompt"
      :form-data="formData"
      @save="savePrompt"
      @cancel="closeModal"
    />

    <SystemPromptsImportModal
      :is-visible="showImportModal"
      :import-data="importData"
      :import-error="importError"
      @import="performImport"
      @cancel="closeImportModal"
    />

    <SystemPromptsSchemaModal
      :is-visible="showSchemaModal"
      :is-loading-schema="isLoadingSchema"
      :schema-error="schemaError"
      :generated-prompts="generatedPrompts"
      :selected-prompts="selectedPrompts"
      :schema-summary="schemaSummary"
      :field-details="fieldDetails"
      @add-selected="addSelectedPrompts"
      @cancel="closeSchemaModal"
    />
  </div>
</template>

<script setup lang="ts">
const { 
  getSystemPrompts,
  addSystemPrompt,
  updateSystemPrompt,
  deleteSystemPrompt,
  toggleSystemPrompt,
  exportSystemPrompts,
  importSystemPrompts 
} = useSystemPrompts()

const {
  isLoading: isLoadingSchema,
  error: schemaError,
  fetchSchema,
  generateSystemPrompts: generateFromSchema,
  getSchemaSummary,
  getFieldDetails,
  needsRefresh
} = useNotionSchema()

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

// Computed properties for schema info
const schemaSummary = getSchemaSummary
const fieldDetails = getFieldDetails

const formData = ref({
  name: '',
  content: '',
  active: true
})

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

const savePrompt = (formData: any) => {
  if (editingPrompt.value) {
    updateSystemPrompt(editingPrompt.value.id, formData)
  } else {
    addSystemPrompt(formData.name, formData.content)
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

const exportPrompts = () => {
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

const performImport = (data: string) => {
  importError.value = ''
  
  if (!data.trim()) {
    importError.value = 'Please provide JSON data to import'
    return
  }
  
  const success = importSystemPrompts(data)
  
  if (success) {
    closeImportModal()
    loadPrompts()
  } else {
    importError.value = 'Invalid JSON format or data structure'
  }
}

// Schema generation functions
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

const addSelectedPrompts = (selectedIndices: number[]) => {
  const promptsToAdd = selectedIndices
    .map(index => generatedPrompts.value[index])
    .filter(prompt => prompt !== undefined) // Filter out undefined values
  const systemPromptsToAdd = convertToSystemPrompts(promptsToAdd)
  
  // Add each prompt individually
  systemPromptsToAdd.forEach(prompt => {
    addSystemPrompt(prompt.name, prompt.content)
  })
  
  closeSchemaModal()
  loadPrompts()
  
  // Show success message
  alert(`Successfully added ${systemPromptsToAdd.length} system prompts from your Notion database!`)
}

onMounted(() => {
  loadPrompts()
})
</script>