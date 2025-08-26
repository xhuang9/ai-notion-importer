<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Update Actions with LLM</h3>
        <button @click="handleCancel" class="text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Current Actions Summary -->
      <div class="mb-6">
        <h4 class="font-medium mb-2">Current Actions ({{ operations.length }})</h4>
        <div class="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
          <div v-for="(operation, index) in operations" :key="operation.id" class="mb-2 last:mb-0">
            <span class="text-sm">
              {{ index + 1 }}. {{ getMainFieldValue(operation.fields) }} 
              <span class="text-gray-500">({{ operation.kind }})</span>
            </span>
          </div>
        </div>
      </div>

      <!-- LLM Prompt Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="userPrompt" class="block text-sm font-medium text-gray-700 mb-2">
            How would you like to modify these actions?
          </label>
          <textarea
            id="userPrompt"
            v-model="userPrompt"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            placeholder="Examples:
- Change all priorities to 'Important'
- Add due dates one week from today for all tasks without dates
- Update the first task's title to 'Setup Development Environment'
- Change status of completed tasks to 'Done'
- Add 'urgent' tag to tasks containing 'meeting'
- Modify task #2 to have priority 'High' and due date tomorrow
- Remove all tags from tasks with 'planning' in the title"
            required
          ></textarea>
          <p class="text-xs text-gray-500 mt-1">
            Describe what changes you want to make to the existing actions. You can modify specific tasks, update field values, or apply bulk changes to multiple actions.
          </p>
        </div>

        <!-- Quick Action Templates -->
        <div class="space-y-2">
          <h5 class="text-sm font-medium text-gray-700">Quick Templates:</h5>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="template in quickTemplates"
              :key="template.name"
              @click="userPrompt = template.prompt"
              type="button"
              class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
            >
              {{ template.name }}
            </button>
          </div>
        </div>

        <!-- Advanced Options -->
        <details class="border rounded-lg p-3">
          <summary class="cursor-pointer font-medium text-sm">Advanced Options</summary>
          <div class="mt-3 space-y-3">
            <div class="flex items-center">
              <input
                id="preserveApproved"
                v-model="preserveApproved"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="preserveApproved" class="ml-2 text-sm text-gray-700">
                Only modify unapproved actions
              </label>
            </div>
            
            <div class="flex items-center">
              <input
                id="addWarnings"
                v-model="addWarnings"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="addWarnings" class="ml-2 text-sm text-gray-700">
                Request LLM to add warnings for significant changes
              </label>
            </div>
          </div>
        </details>

        <!-- System Prompts Info -->
        <div v-if="systemPrompts.length > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h5 class="text-sm font-medium text-blue-800 mb-1">Active System Prompts ({{ systemPrompts.length }})</h5>
          <p class="text-xs text-blue-600">
            The LLM will follow your database structure and field validation rules from these prompts.
          </p>
        </div>

        <!-- Loading and Error States -->
        <div v-if="isLoading" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-2"></div>
          <p class="text-sm text-yellow-800">Processing your request...</p>
          <p class="text-xs text-yellow-600 mt-1">This may take a few seconds</p>
        </div>

        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <h5 class="text-sm font-medium text-red-800 mb-1">Error</h5>
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>

        <!-- Results Preview -->
        <div v-if="previewResults" class="space-y-3">
          <h5 class="font-medium text-green-800">Preview Updated Actions:</h5>
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 max-h-60 overflow-y-auto">
            <div v-for="(operation, index) in previewResults.updatedOperations" :key="operation.id" class="mb-3 last:mb-0">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <span class="font-medium">{{ index + 1 }}. {{ getMainFieldValue(operation.fields) }}</span>
                  <div class="text-xs text-gray-600 mt-1">
                    <span v-for="(value, field) in getSecondaryFields(operation.fields)" :key="field" class="mr-3">
                      {{ field }}: {{ formatFieldValue(value) }}
                    </span>
                  </div>
                </div>
                <span v-if="operation.edited" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Modified</span>
              </div>
            </div>
          </div>
          
          <div v-if="previewResults.reasoning" class="text-sm text-gray-700">
            <strong>Reasoning:</strong> {{ previewResults.reasoning }}
          </div>
          
          <div v-if="previewResults.warnings.length > 0" class="bg-yellow-50 border border-yellow-200 rounded p-3">
            <strong class="text-yellow-800">Warnings:</strong>
            <ul class="text-sm text-yellow-700 list-disc list-inside mt-1">
              <li v-for="warning in previewResults.warnings" :key="warning">{{ warning }}</li>
            </ul>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 pt-4 border-t">
          <button
            @click="handleCancel"
            type="button"
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            :disabled="isLoading"
          >
            Cancel
          </button>
          
          <button
            v-if="!previewResults"
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            :disabled="isLoading || !userPrompt.trim()"
          >
            {{ isLoading ? 'Processing...' : 'Generate Updates' }}
          </button>
          
          <template v-else>
            <button
              @click="resetPreview"
              type="button"
              class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Modify Request
            </button>
            <button
              @click="applyChanges"
              type="button"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Apply Changes
            </button>
          </template>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isVisible: boolean
  operations: OperationPlan[]
  systemPrompts: Array<{
    id: string
    name: string
    content: string
    active: boolean
  }>
}

interface Emits {
  update: [operations: OperationPlan[]]
  close: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Reactive state
const userPrompt = ref('')
const isLoading = ref(false)
const error = ref('')
const previewResults = ref<LLMPromptResponse | null>(null)
const preserveApproved = ref(true)
const addWarnings = ref(true)

// Quick action templates
const quickTemplates = ref([
  { name: 'High Priority', prompt: 'Change all task priorities to "Important"' },
  { name: 'Add Due Dates', prompt: 'Add due dates one week from today to all tasks without due dates' },
  { name: 'In Progress Status', prompt: 'Change status of first 3 tasks to "In Progress"' },
  { name: 'Add Project Tag', prompt: 'Add "Q1 Planning" tag to all tasks' },
  { name: 'Update First Task', prompt: 'Change the title of the first task to "Updated Task Title" and set priority to High' },
  { name: 'Clear All Tags', prompt: 'Remove all existing tags from all tasks' }
])

// Form submission
const handleSubmit = async () => {
  if (!userPrompt.value.trim()) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    // Filter operations based on preserveApproved setting
    const operationsToModify = preserveApproved.value 
      ? props.operations.filter(op => !op.approved)
      : props.operations
    
    // Check if there are no operations to modify
    if (operationsToModify.length === 0) {
      error.value = preserveApproved.value 
        ? 'No unapproved actions to modify. All actions are already approved.'
        : 'No actions available to modify.'
      isLoading.value = false
      return
    }
    
    // Build the full prompt with options
    let fullPrompt = userPrompt.value
    
    if (addWarnings.value) {
      fullPrompt += '\n\nImportant: Please add warnings for any significant changes that might affect the user\'s workflow or data integrity.'
    }
    
    if (preserveApproved.value && operationsToModify.length < props.operations.length) {
      fullPrompt += `\n\nNote: Only modify the ${operationsToModify.length} unapproved operations. Leave approved operations unchanged.`
    }
    
    const response = await updateOperationsWithLLM({
      operations: operationsToModify,
      userPrompt: fullPrompt,
      systemPrompts: props.systemPrompts
    })
    
    if (response.success) {
      // Merge back with unchanged operations if preserveApproved was used
      let updatedOperations = response.updatedOperations
      
      if (preserveApproved.value) {
        const approvedOps = props.operations.filter(op => op.approved)
        updatedOperations = [...approvedOps, ...response.updatedOperations]
      }
      
      previewResults.value = {
        ...response,
        updatedOperations
      }
    } else {
      error.value = response.warnings[0] || 'Failed to update operations'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred'
  } finally {
    isLoading.value = false
  }
}

const applyChanges = () => {
  if (previewResults.value) {
    emit('update', previewResults.value.updatedOperations)
    emit('close')
  }
}

const resetPreview = () => {
  previewResults.value = null
  error.value = ''
}

const handleCancel = () => {
  if (!isLoading.value) {
    emit('close')
  }
}

// Reset state when modal opens/closes
watch(() => props.isVisible, (visible) => {
  if (visible) {
    userPrompt.value = ''
    previewResults.value = null
    error.value = ''
    isLoading.value = false
  }
})
</script>