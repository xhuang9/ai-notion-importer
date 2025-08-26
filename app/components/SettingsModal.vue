<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold">Settings</h3>
        <button @click="handleClose" class="text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <Settings @save="handleSave" @cancel="handleClose" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isVisible: boolean
}

interface Emits {
  close: []
  saved: []
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function handleSave() {
  emit('saved')
  emit('close')
}

function handleClose() {
  emit('close')
}
</script>