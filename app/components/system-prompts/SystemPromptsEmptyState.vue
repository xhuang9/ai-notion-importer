<template>
  <div class="text-center py-8 text-gray-500">
    No system prompts configured. 
    <button @click="$emit('generate-from-notion')" class="text-blue-600 hover:text-blue-800 underline">
      Generate prompts from your Notion database
    </button> 
    or add your first prompt manually.
  </div>
</template>

<script setup lang="ts">
interface Emits {
  'generate-from-notion': []
}

defineEmits<Emits>()
</script>