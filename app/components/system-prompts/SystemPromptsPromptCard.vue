<template>
  <div 
    class="border border-gray-200 rounded-lg p-4"
    :class="{ 'bg-green-50 border-green-200': prompt.active }"
  >
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <button
            @click="$emit('toggle', prompt.id)"
            class="flex items-center justify-center w-5 h-5 rounded border-2"
            :class="prompt.active ? 'bg-green-500 border-green-500' : 'border-gray-300'"
          >
            <svg v-if="prompt.active" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          <h3 class="font-semibold text-lg">{{ prompt.name }}</h3>
          <span v-if="prompt.active" class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            Active
          </span>
        </div>
        <p class="text-gray-600 text-sm mb-2 line-clamp-3">{{ prompt.content }}</p>
        <div class="text-xs text-gray-400">
          Created: {{ formatDate(prompt.createdAt) }}
          <span v-if="prompt.updatedAt !== prompt.createdAt">
            • Updated: {{ formatDate(prompt.updatedAt) }}
          </span>
        </div>
      </div>
      
      <div class="flex gap-2 ml-4">
        <button @click="$emit('edit', prompt)" class="text-blue-600 hover:text-blue-800">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button @click="$emit('delete', prompt.id)" class="text-red-600 hover:text-red-800">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  prompt: SystemPrompt
}

interface Emits {
  toggle: [id: string]
  edit: [prompt: SystemPrompt]
  delete: [id: string]
}

defineProps<Props>()
defineEmits<Emits>()

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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