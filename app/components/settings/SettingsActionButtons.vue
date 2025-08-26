<template>
  <div class="flex justify-between pt-4 border-t">
    <div class="flex gap-2">
      <button
        type="button"
        @click="$emit('clear-settings')"
        class="px-4 py-2 text-red-700 border border-red-300 rounded-md hover:bg-red-50"
        v-if="hasStoredSettings"
      >
        Clear All Settings
      </button>
      <button
        type="button"
        @click="$emit('test-connection')"
        class="px-4 py-2 text-blue-700 border border-blue-300 rounded-md hover:bg-blue-50"
        :disabled="isTestingConnection"
      >
        {{ isTestingConnection ? 'Testing...' : 'Test Connection' }}
      </button>
    </div>
    
    <div class="flex gap-2">
      <button
        @click="$emit('cancel')"
        type="button"
        class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        :disabled="hasValidationErrors"
      >
        Save Settings
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  hasStoredSettings: boolean
  isTestingConnection: boolean
  hasValidationErrors: boolean
}

interface Emits {
  'clear-settings': []
  'test-connection': []
  cancel: []
}

defineProps<Props>()
defineEmits<Emits>()
</script>