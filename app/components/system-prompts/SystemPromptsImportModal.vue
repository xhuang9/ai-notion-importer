<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
      <h3 class="text-xl font-bold mb-4">Import System Prompts</h3>
      
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">JSON Data</label>
        <textarea
          v-model="localImportData"
          class="input-field min-h-32"
          placeholder="Paste exported JSON data here"
        ></textarea>
      </div>
      
      <div v-if="importError" class="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
        {{ importError }}
      </div>
      
      <div class="flex justify-end gap-2">
        <button @click="$emit('cancel')" class="btn-secondary">
          Cancel
        </button>
        <button @click="handleImport" class="btn-primary">
          Import
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isVisible: boolean
  importData: string
  importError: string
}

interface Emits {
  import: [data: string]
  cancel: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localImportData = ref(props.importData)

watch(() => props.importData, (newData) => {
  localImportData.value = newData
})

const handleImport = () => {
  emit('import', localImportData.value)
}
</script>