<template>
  <div v-if="schemaSummary" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <h3 class="font-semibold text-blue-900 mb-2">Connected Notion Database</h3>
    <div class="text-sm text-blue-800">
      <p><strong>{{ schemaSummary.title }}</strong></p>
      <p>{{ schemaSummary.totalFields }} fields • {{ schemaSummary.selectFieldsCount }} select fields with {{ schemaSummary.totalOptionsCount }} total options</p>
      <p v-if="schemaSummary.hasSampleData">{{ schemaSummary.sampleDataCount }} sample records analyzed</p>
      <p v-if="needsRefresh" class="text-amber-600 mt-1">⚠️ Schema data is outdated. Click "Generate from Notion" to refresh.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  schemaSummary: any
  needsRefresh: boolean
}

defineProps<Props>()
</script>