<template>
  <tr
    class="hover:bg-gray-50"
    :class="{
      'bg-green-50': operation.approved,
      'bg-yellow-50': operation.edited,
      'border-l-4 border-l-red-400': operation.warnings.length > 0
    }"
  >
    <!-- Approval Checkbox -->
    <td class="table-cell">
      <input
        :checked="operation.approved"
        @change="$emit('toggle-approval')"
        type="checkbox"
        class="mr-2"
      />
    </td>

    <!-- Operation Type -->
    <td class="table-cell">
      <div class="flex items-center">
        <span
          class="px-2 py-1 text-xs rounded-full"
          :class="getOperationTypeClass(operation.kind)"
        >
          {{ operation.kind }}
        </span>
        <span v-if="operation.taskId" class="ml-2 text-xs text-gray-500">
          ID: {{ operation.taskId.slice(0, 8) }}...
        </span>
      </div>
    </td>

    <!-- Task Details -->
    <td class="table-cell">
      <div class="space-y-2 max-w-sm">
        <div>
          <strong>{{ getMainFieldValue(operation.fields) }}</strong>
          <span v-if="operation.edited" class="ml-2 text-xs text-blue-600">(edited)</span>
        </div>
        
        <!-- Dynamic field display -->
        <div class="flex flex-wrap gap-1 text-xs">
          <span
            v-for="(value, fieldName) in operation.fields"
            :key="fieldName"
            v-show="!isMainField(fieldName) && value !== null && value !== undefined && value !== ''"
            class="px-2 py-1 rounded bg-gray-100"
          >
            {{ fieldName }}: {{ formatFieldValue(value) }}
          </span>
        </div>
      </div>
    </td>

    <!-- Reason -->
    <td class="table-cell">
      <p class="text-sm max-w-xs line-clamp-3">{{ operation.reason }}</p>
    </td>

    <!-- Confidence -->
    <td class="table-cell">
      <div class="flex items-center">
        <div
          class="w-12 h-2 bg-gray-200 rounded-full overflow-hidden"
          :title="`${operation.confidence}%`"
        >
          <div
            class="h-full transition-all duration-300"
            :class="getConfidenceClass(operation.confidence)"
            :style="{ width: `${operation.confidence}%` }"
          ></div>
        </div>
        <span class="ml-2 text-xs text-gray-600">{{ operation.confidence }}%</span>
      </div>
      
      <!-- Warnings -->
      <div v-if="operation.warnings.length > 0" class="mt-2">
        <div class="flex items-start">
          <svg class="w-4 h-4 text-amber-500 mt-0.5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <div class="text-xs text-amber-700">
            <div v-for="warning in operation.warnings" :key="warning">
              {{ warning }}
            </div>
          </div>
        </div>
      </div>
    </td>

    <!-- Actions -->
    <td class="table-cell">
      <div class="flex gap-1">
        <button
          @click="$emit('edit')"
          class="p-1 text-blue-600 hover:text-blue-800"
          title="Edit operation"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          @click="$emit('delete')"
          class="p-1 text-red-600 hover:text-red-800"
          title="Delete operation"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
defineProps<{
  operation: OperationPlan
}>()

defineEmits<{
  'toggle-approval': []
  'edit': []
  'delete': []
}>()

// Styling functions auto-imported from shared/utils/plan-review-helpers.ts
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>