<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <h3 class="text-xl font-bold mb-4">Generate System Prompts from Notion Database</h3>
      
      <div v-if="isLoadingSchema" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Analyzing your Notion database structure...</p>
      </div>

      <div v-else-if="schemaError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        <strong>Error:</strong> {{ schemaError }}
      </div>

      <div v-else-if="generatedPrompts.length > 0">
        <!-- Generated Prompts Preview -->
        <div class="mb-6">
          <h4 class="font-semibold mb-3">Generated {{ generatedPrompts.length }} System Prompts:</h4>
          
          <div class="space-y-4 max-h-96 overflow-y-auto">
            <div 
              v-for="(prompt, index) in generatedPrompts" 
              :key="index"
              class="border border-gray-200 rounded p-4"
              :class="selectedPrompts.includes(index) ? 'bg-blue-50 border-blue-300' : ''"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-start">
                  <input
                    v-model="localSelectedPrompts"
                    :value="index"
                    type="checkbox"
                    class="mt-1 mr-3"
                  />
                  <div>
                    <h5 class="font-medium">{{ prompt.name }}</h5>
                    <span class="text-xs px-2 py-1 bg-gray-100 rounded">{{ prompt.category }}</span>
                    <p class="text-sm text-gray-600 mt-2 line-clamp-3">{{ prompt.content }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p class="text-sm text-yellow-800">
              <strong>Note:</strong> These prompts are generated based on your current database structure. 
              Select the ones you want to add to your system prompts.
            </p>
          </div>
        </div>

        <!-- Database Schema Info -->
        <div v-if="schemaSummary" class="mb-6 p-4 bg-gray-50 rounded">
          <h5 class="font-medium mb-2">Database Analysis:</h5>
          <div class="text-sm text-gray-700">
            <p><strong>Database:</strong> {{ schemaSummary.title }}</p>
            <p><strong>Fields:</strong> {{ schemaSummary.totalFields }} total</p>
            <p><strong>Select Fields:</strong> {{ schemaSummary.selectFieldsCount }} with {{ schemaSummary.totalOptionsCount }} options</p>
            <div v-if="fieldDetails.length > 0" class="mt-2">
              <strong>Field Options:</strong>
              <ul class="ml-4 mt-1">
                <li v-for="field in fieldDetails.filter(f => f.hasOptions)" :key="field.name" class="text-xs">
                  <strong>{{ field.name }}:</strong> {{ field.options.join(', ') }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <button @click="$emit('cancel')" class="btn-secondary">
          Cancel
        </button>
        <button 
          @click="handleAddSelected" 
          class="btn-primary"
          :disabled="localSelectedPrompts.length === 0"
          v-if="generatedPrompts.length > 0"
        >
          Add {{ localSelectedPrompts.length }} Selected Prompts
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isVisible: boolean
  isLoadingSchema: boolean
  schemaError: string
  generatedPrompts: any[]
  selectedPrompts: number[]
  schemaSummary: any
  fieldDetails: any[]
}

interface Emits {
  'add-selected': [selectedIndices: number[]]
  cancel: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localSelectedPrompts = ref([...props.selectedPrompts])

watch(() => props.selectedPrompts, (newSelected) => {
  localSelectedPrompts.value = [...newSelected]
})

const handleAddSelected = () => {
  emit('add-selected', localSelectedPrompts.value)
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>