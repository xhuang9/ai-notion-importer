<template>
  <div class="card">
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2">LLM → Notion Operation Assistant</h1>
      <p class="text-gray-600">Submit a prompt with optional attachments to generate Notion database operations</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Prompt Input -->
      <div>
        <label class="block text-sm font-medium mb-2">
          Prompt <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="formData.prompt"
          class="input-field min-h-32"
          placeholder="Describe the tasks you want to create or manage in Notion. You can mention specific priorities, due dates, tags, etc."
          required
          :disabled="isSubmitting"
        ></textarea>
        <p class="text-xs text-gray-500 mt-1">
          Example: "Create high-priority tasks for Q1 planning meeting prep, due by next Friday"
        </p>
      </div>

      <!-- File Upload -->
      <div>
        <label class="block text-sm font-medium mb-2">
          Attachments (Optional)
        </label>
        <div
          @drop="handleDrop"
          @dragover.prevent
          @dragenter.prevent
          class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
          :class="{ 'border-blue-400 bg-blue-50': isDragging }"
        >
          <input
            ref="fileInput"
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.csv"
            @change="handleFileSelect"
            class="hidden"
          />
          
          <div v-if="formData.files.length === 0">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <p class="text-gray-500 mb-2">
              <button
                type="button"
                @click="fileInput?.click()"
                class="text-blue-600 hover:text-blue-800 font-medium"
              >
                Click to upload
              </button>
              or drag and drop files here
            </p>
            <p class="text-xs text-gray-400">
              Supports: Images (JPG, PNG), PDF documents, CSV files
            </p>
          </div>
          
          <div v-else class="space-y-2">
            <div
              v-for="(file, index) in formData.files"
              :key="index"
              class="flex items-center justify-between bg-gray-50 rounded p-3"
            >
              <div class="flex items-center">
                <div class="w-8 h-8 rounded bg-blue-100 flex items-center justify-center mr-3">
                  <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ file.name }}</p>
                  <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }} • {{ getFileType(file.type) }}</p>
                </div>
              </div>
              <button
                type="button"
                @click="removeFile(index)"
                class="text-red-600 hover:text-red-800"
                :disabled="isSubmitting"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <button
              type="button"
              @click="fileInput?.click()"
              class="text-sm text-blue-600 hover:text-blue-800"
              :disabled="isSubmitting"
            >
              + Add more files
            </button>
          </div>
        </div>
      </div>

      <!-- Active System Prompts Display -->
      <div v-if="activeSystemPrompts.length > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="font-medium text-blue-900 mb-2">Active System Prompts ({{ activeSystemPrompts.length }})</h3>
        <div class="text-sm text-blue-800">
          <div v-for="prompt in activeSystemPrompts" :key="prompt.id" class="flex items-center gap-2 mb-1">
            <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            {{ prompt.name }}
          </div>
        </div>
        <p class="text-xs text-blue-600 mt-2">
          These prompts will influence how the LLM generates your Notion update actions
        </p>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-between items-center">
        <div class="text-sm text-gray-500">
          <span v-if="formData.files.length > 0">
            {{ formData.files.length }} file{{ formData.files.length > 1 ? 's' : '' }} attached
          </span>
        </div>
        
        <button
          type="submit"
          class="btn-primary"
          :disabled="isSubmitting || !formData.prompt.trim()"
        >
          <div v-if="isSubmitting" class="flex items-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Generating Plan...
          </div>
          <div v-else class="flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            Generate actions
          </div>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  submit: [data: { prompt: string; files: File[]; systemPrompts: SystemPrompt[] }]
}>()

const fileInput = ref<HTMLInputElement>()
const { getActiveSystemPrompts } = useSystemPrompts()

const formData = ref({
  prompt: '',
  files: [] as File[]
})

const isSubmitting = ref(false)
const isDragging = ref(false)
const activeSystemPrompts = ref<SystemPrompt[]>([])

const loadActiveSystemPrompts = () => {
  activeSystemPrompts.value = getActiveSystemPrompts()
}

const handleSubmit = async () => {
  if (!formData.value.prompt.trim()) return
  
  isSubmitting.value = true
  
  try {
    emit('submit', {
      prompt: formData.value.prompt,
      files: formData.value.files,
      systemPrompts: activeSystemPrompts.value
    })
  } finally {
    isSubmitting.value = false
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addFiles(Array.from(target.files))
    target.value = '' // Reset input
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  event.preventDefault()
  
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files))
  }
}

const addFiles = (newFiles: File[]) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'text/csv']
  const maxSize = 10 * 1024 * 1024 // 10MB
  
  for (const file of newFiles) {
    if (!allowedTypes.includes(file.type)) {
      alert(`File "${file.name}" is not supported. Please use JPG, PNG, PDF, or CSV files.`)
      continue
    }
    
    if (file.size > maxSize) {
      alert(`File "${file.name}" is too large. Please use files smaller than 10MB.`)
      continue
    }
    
    // Check for duplicates
    const isDuplicate = formData.value.files.some(f => 
      f.name === file.name && f.size === file.size && f.type === file.type
    )
    
    if (!isDuplicate) {
      formData.value.files.push(file)
    }
  }
}

const removeFile = (index: number) => {
  formData.value.files.splice(index, 1)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const getFileType = (mimeType: string): string => {
  const typeMap: Record<string, string> = {
    'image/jpeg': 'Image',
    'image/jpg': 'Image', 
    'image/png': 'Image',
    'application/pdf': 'PDF',
    'text/csv': 'CSV'
  }
  
  return typeMap[mimeType] || 'File'
}

// Reset form after successful submission
const resetForm = () => {
  formData.value = {
    prompt: '',
    files: []
  }
}

defineExpose({
  resetForm
})

onMounted(() => {
  loadActiveSystemPrompts()
  
  // Listen for system prompt changes
  window.addEventListener('storage', loadActiveSystemPrompts)
})

onUnmounted(() => {
  window.removeEventListener('storage', loadActiveSystemPrompts)
})
</script>