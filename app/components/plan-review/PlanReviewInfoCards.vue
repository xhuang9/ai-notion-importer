<template>
  <div>
    <!-- Plan Reasoning -->
    <div v-if="reasoning" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 class="font-medium text-blue-900 mb-2">Plan Reasoning</h3>
      <p class="text-blue-800 text-sm">{{ reasoning }}</p>
    </div>

    <!-- General Warnings -->
    <div v-if="generalWarnings.length > 0" class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <h3 class="font-medium text-amber-900 mb-2">General Warnings</h3>
      <ul class="text-amber-800 text-sm space-y-1">
        <li v-for="warning in generalWarnings" :key="warning" class="flex items-start">
          <svg class="w-4 h-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          {{ warning }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  reasoning?: string
  generalWarnings: string[]
}>()
</script>