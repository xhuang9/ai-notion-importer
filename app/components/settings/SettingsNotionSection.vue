<template>
  <div class="border rounded-lg p-4">
    <h4 class="font-medium text-gray-900 mb-4 flex items-center">
      <svg class="w-5 h-5 mr-2 text-black" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.467l13.215-.747c.56 0 .093-.466-.093-.56L17.66 1.734c-.373-.186-.746-.279-1.213-.093L3.246 4.088c-.466.186-.559.372-.187.56zm.746 2.335v13.588c0 .746.373 1.026 1.213.933l14.521-.839c.839-.093.933-.466.933-1.026V6.22c0-.746-.279-.933-.746-.84L6.039 6.59c-.466.093-.834.28-.834.933zm12.055 2.241c.093.466 0 .933-.466.933l-.747.094v10.612c-.653.373-1.226.373-1.599.093l-4.917-7.906v7.626l1.506.187s0 .933-1.293.933l-3.597.094c-.093-.186 0-.653.279-.746l.84-.187V9.854L5.132 9.76c-.094-.466.186-1.132.933-1.226l3.877-.28 5.123 7.94V9.107l-1.226-.093c-.093-.56.279-1.026.746-1.119z"/>
      </svg>
      Notion Configuration
    </h4>
    
    <div class="space-y-4">
      <div>
        <label for="notionApiKey" class="block text-sm font-medium text-gray-700 mb-2">
          Notion API Key
          <span class="text-red-500">*</span>
        </label>
        <input
          id="notionApiKey"
          v-model="formData.NOTION_API_KEY"
          :type="showApiKey ? 'text' : 'password'"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          :placeholder="envDefaults.NOTION_API_KEY ? 'Optional: Override .env value' : 'ntn_...'"
        />
        <div class="flex items-center justify-between mt-1">
          <button
            type="button"
            @click="$emit('update:showApiKey', !showApiKey)"
            class="text-xs text-blue-600 hover:text-blue-800"
            v-if="formData.NOTION_API_KEY || !envDefaults.NOTION_API_KEY"
          >
            {{ showApiKey ? 'Hide' : 'Show' }} API Key
          </button>
          <p class="text-xs text-gray-500">Required for Notion database access</p>
        </div>
      </div>
      
      <div>
        <label for="notionDatabaseId" class="block text-sm font-medium text-gray-700 mb-2">
          Notion Database ID
          <span class="text-red-500">*</span>
        </label>
        <input
          id="notionDatabaseId"
          v-model="formData.NOTION_DATABASE_ID"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          :placeholder="envDefaults.NOTION_DATABASE_ID ? 'Optional: Override .env value' : 'Database ID from Notion URL'"
        />
        <p class="text-xs text-gray-500 mt-1">
          {{ envDefaults.NOTION_DATABASE_ID ? 'Override .env value if needed' : 'Found in your Notion database URL' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  formData: SettingsData
  envDefaults: Partial<EnvDefaults>
  showApiKey: boolean
}

interface Emits {
  'update:showApiKey': [value: boolean]
}

defineProps<Props>()
defineEmits<Emits>()
</script>