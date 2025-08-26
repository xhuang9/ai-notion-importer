<template>
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-2xl font-bold">System Prompts</h2>
    <div class="flex gap-2">
      <button 
        @click="$emit('generate-from-notion')" 
        class="btn-secondary"
        :disabled="isGeneratingFromNotion"
      >
        <div v-if="isGeneratingFromNotion" class="flex items-center">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
          Generating...
        </div>
        <span v-else>Generate from Notion</span>
      </button>
      <button @click="$emit('import')" class="btn-secondary">
        Import
      </button>
      <button @click="$emit('export')" class="btn-secondary">
        Export
      </button>
      <button @click="$emit('create-new')" class="btn-primary">
        Add New
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isGeneratingFromNotion: boolean
}

interface Emits {
  'generate-from-notion': []
  import: []
  export: []
  'create-new': []
}

defineProps<Props>()
defineEmits<Emits>()
</script>