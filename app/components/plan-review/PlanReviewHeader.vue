<template>
  <div class="flex justify-between items-center mb-6">
    <div>
      <h2 class="text-2xl font-bold">Notion update actions</h2>
      <p class="text-gray-600 mt-1">
        Review and approve the generated operations before execution
      </p>
    </div>
    
    <div class="flex items-center gap-4">
      <div class="text-sm text-gray-600">
        {{ approvedCount }}/{{ totalOperations }} approved
      </div>
      <button
        @click="$emit('llm-update')"
        class="btn-secondary"
        title="Update actions using AI"
      >
        LLM Update
      </button>
      <button
        @click="$emit('approve-all')"
        class="btn-secondary"
        :disabled="allApproved"
      >
        Approve All
      </button>
      <button
        @click="$emit('execute')"
        class="btn-primary"
        :disabled="approvedCount === 0 || isExecuting"
      >
        <div v-if="isExecuting" class="flex items-center">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Executing...
        </div>
        <span v-else>Execute {{ approvedCount }} Operations</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  approvedCount: number
  totalOperations: number
  allApproved: boolean
  isExecuting: boolean
}>()

defineEmits<{
  'llm-update': []
  'approve-all': []
  'execute': []
}>()
</script>