<template>
  <div 
    v-if="isVisible" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <h3 class="text-xl font-bold mb-4">Edit Operation</h3>
      
      <form @submit.prevent="handleSave" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Task Name</label>
          <input v-model="localForm.name" class="input-field" required />
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Status</label>
            <select v-model="localForm.status" class="input-field">
              <option>Not Started</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>On Hold</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Priority</label>
            <select v-model="localForm.priority" class="input-field">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Due Date</label>
            <input v-model="localForm.due" type="date" class="input-field" />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Rank</label>
            <input v-model.number="localForm.rank" type="number" class="input-field" min="0" max="1000" />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">Tags (comma-separated)</label>
          <input v-model="localForm.tagsString" class="input-field" placeholder="tag1, tag2, tag3" />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">Notes</label>
          <textarea v-model="localForm.notes" class="input-field min-h-20"></textarea>
        </div>
        
        <div class="flex justify-end gap-2 pt-4">
          <button type="button" @click="$emit('cancel')" class="btn-secondary">
            Cancel
          </button>
          <button type="submit" class="btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isVisible: boolean
  editForm: {
    name: string
    status: string
    priority: string
    due: string
    rank: number
    tagsString: string
    notes: string
  }
}

interface Emits {
  save: [formData: any]
  cancel: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localForm = ref({ ...props.editForm })

watch(() => props.editForm, (newForm) => {
  localForm.value = { ...newForm }
}, { deep: true })

const handleSave = () => {
  emit('save', localForm.value)
}
</script>