<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <h3 class="text-xl font-bold mb-4">
        {{ editingPrompt ? 'Edit System Prompt' : 'Create System Prompt' }}
      </h3>
      
      <form @submit.prevent="handleSave">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Name</label>
          <input
            v-model="localFormData.name"
            type="text"
            class="input-field"
            placeholder="Enter prompt name"
            required
          />
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Content</label>
          <textarea
            v-model="localFormData.content"
            class="input-field min-h-80"
            placeholder="Enter your system prompt content"
            required
          ></textarea>
        </div>
        
        <div class="mb-6">
          <label class="flex items-center">
            <input
              v-model="localFormData.active"
              type="checkbox"
              class="mr-2"
            />
            Active (will be used in plan generation)
          </label>
        </div>
        
        <div class="flex justify-end gap-2">
          <button type="button" @click="$emit('cancel')" class="btn-secondary">
            Cancel
          </button>
          <button type="submit" class="btn-primary">
            {{ editingPrompt ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isVisible: boolean
  editingPrompt: SystemPrompt | null
  formData: {
    name: string
    content: string
    active: boolean
  }
}

interface Emits {
  save: [formData: any]
  cancel: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localFormData = ref({ ...props.formData })

watch(() => props.formData, (newFormData) => {
  localFormData.value = { ...newFormData }
}, { deep: true })

const handleSave = () => {
  emit('save', localFormData.value)
}
</script>