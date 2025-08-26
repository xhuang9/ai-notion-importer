<template>
  <div v-if="errors.length > 0" class="bg-red-50 border border-red-200 rounded-md p-3">
    <h4 class="text-sm font-medium text-red-800 mb-1">Please fix the following issues:</h4>
    <ul class="text-sm text-red-700 list-disc list-inside">
      <li v-for="error in errors" :key="error">{{ error }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
interface Props {
  errors: string[]
}

defineProps<Props>()
</script>