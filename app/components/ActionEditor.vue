<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Edit Action</h3>
        <button @click="handleCancel" class="text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSave" class="space-y-4">
        <!-- Dynamic field editing -->
        <div v-for="(value, fieldName) in editForm" :key="fieldName" class="space-y-2">
          <label :for="fieldName" class="block text-sm font-medium text-gray-700">
            {{ formatFieldLabel(fieldName) }}
          </label>
          
          <!-- Array fields (tags, etc.) -->
          <textarea
            v-if="isArrayField(fieldName)"
            :id="fieldName"
            v-model="editForm[fieldName]"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows="2"
            :placeholder="`Enter ${formatFieldLabel(fieldName).toLowerCase()}, separated by commas`"
          ></textarea>
          
          <!-- Date fields -->
          <input
            v-else-if="isDateField(fieldName)"
            :id="fieldName"
            v-model="editForm[fieldName]"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          
          <!-- Number fields -->
          <input
            v-else-if="isNumberField(fieldName)"
            :id="fieldName"
            v-model.number="editForm[fieldName]"
            type="number"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          
          <!-- Long text fields -->
          <textarea
            v-else-if="isLongTextField(fieldName)"
            :id="fieldName"
            v-model="editForm[fieldName]"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows="3"
          ></textarea>
          
          <!-- Default text input -->
          <input
            v-else
            :id="fieldName"
            v-model="editForm[fieldName]"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          
          <!-- Field hints -->
          <p v-if="getFieldHint(fieldName)" class="text-xs text-gray-500">
            {{ getFieldHint(fieldName) }}
          </p>
        </div>

        <!-- Add new field -->
        <div class="border-t pt-4">
          <div class="flex gap-2 mb-2">
            <input
              v-model="newFieldName"
              type="text"
              placeholder="Field name"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              v-model="newFieldValue"
              type="text"
              placeholder="Field value"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              @click="addNewField"
              type="button"
              class="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add
            </button>
          </div>
          <p class="text-xs text-gray-500">Add custom fields if needed</p>
        </div>

        <!-- Validation errors -->
        <div v-if="validationErrors.length > 0" class="bg-red-50 border border-red-200 rounded-md p-3">
          <h4 class="text-sm font-medium text-red-800 mb-1">Please fix the following issues:</h4>
          <ul class="text-sm text-red-700 list-disc list-inside">
            <li v-for="error in validationErrors" :key="error">{{ error }}</li>
          </ul>
        </div>

        <!-- Action buttons -->
        <div class="flex justify-end gap-2 pt-4 border-t">
          <button
            @click="handleCancel"
            type="button"
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            :disabled="validationErrors.length > 0"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  operation: OperationPlan
  index: number
  isVisible: boolean
}>()

const emit = defineEmits<{
  save: [operation: OperationPlan]
  cancel: []
  close: []
}>()

// Reactive state
const editForm = ref<Record<string, any>>({})
const newFieldName = ref('')
const newFieldValue = ref('')
const validationErrors = ref<string[]>([])

// Form validation
const validateForm = () => {
  validationErrors.value = []
  
  // Check for main field (name/title)
  const hasMainField = Object.keys(editForm.value).some(key => isMainField(key))
  if (!hasMainField && !editForm.value.name && !editForm.value.title && !editForm.value.taskName) {
    validationErrors.value.push('A name or title or task name is required')
  }
  
  // Check for empty main field values
  for (const [key, value] of Object.entries(editForm.value)) {
    if (isMainField(key) && (!value || value.toString().trim() === '')) {
      validationErrors.value.push(`${formatFieldLabel(key)} cannot be empty`)
    }
  }
}

// Initialize form when operation changes
watch(() => props.operation, (operation) => {
  if (operation) {
    editForm.value = createEditForm(operation.fields)
    validateForm()
  }
}, { immediate: true })

// Watch form changes for validation
watch(editForm, () => {
  validateForm()
}, { deep: true })

// Field type detection
const isArrayField = (fieldName: string): boolean => {
  return fieldName.toLowerCase().includes('tag') || 
         fieldName.toLowerCase().includes('categories') ||
         fieldName.endsWith('String') // Our converted array fields
}

const isDateField = (fieldName: string): boolean => {
  return fieldName.toLowerCase().includes('due') || 
         fieldName.toLowerCase().includes('date') ||
         fieldName.toLowerCase().includes('deadline')
}

const isNumberField = (fieldName: string): boolean => {
  return fieldName.toLowerCase().includes('rank') ||
         fieldName.toLowerCase().includes('score') ||
         fieldName.toLowerCase().includes('priority_score') ||
         fieldName.toLowerCase().includes('number')
}

const isLongTextField = (fieldName: string): boolean => {
  return fieldName.toLowerCase().includes('note') ||
         fieldName.toLowerCase().includes('description') ||
         fieldName.toLowerCase().includes('comment') ||
         fieldName.toLowerCase().includes('detail')
}

// Field formatting
const formatFieldLabel = (fieldName: string): string => {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace('String', '')
    .trim()
}

const getFieldHint = (fieldName: string): string => {
  if (isArrayField(fieldName)) {
    return 'Separate multiple values with commas'
  }
  if (isDateField(fieldName)) {
    return 'Use YYYY-MM-DD format'
  }
  if (isNumberField(fieldName)) {
    return 'Enter a number (typically 1-1000 for ranking)'
  }
  return ''
}


// Form actions
const addNewField = () => {
  if (newFieldName.value && newFieldValue.value) {
    editForm.value[newFieldName.value] = newFieldValue.value
    newFieldName.value = ''
    newFieldValue.value = ''
  }
}

const handleSave = () => {
  if (validationErrors.value.length > 0) return
  
  const updatedFields = formToFields(editForm.value)
  
  const updatedOperation: OperationPlan = {
    ...props.operation,
    fields: updatedFields,
    edited: true
  }
  
  emit('save', updatedOperation)
  emit('close')
}

const handleCancel = () => {
  emit('cancel')
  emit('close')
}
</script>