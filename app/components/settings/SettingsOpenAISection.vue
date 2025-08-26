<template>
  <div class="border rounded-lg p-4">
    <h4 class="font-medium text-gray-900 mb-4 flex items-center">
      <svg class="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      OpenAI Configuration
    </h4>
    
    <div class="space-y-4">
      <div>
        <label for="openaiApiKey" class="block text-sm font-medium text-gray-700 mb-2">
          OpenAI API Key
          <span class="text-red-500">*</span>
        </label>
        <input
          id="openaiApiKey"
          v-model="formData.OPENAI_API_KEY"
          :type="showApiKey ? 'text' : 'password'"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          :placeholder="envDefaults.OPENAI_API_KEY ? 'Optional: Override .env value' : 'sk-proj-...'"
        />
        <div class="flex items-center justify-between mt-1">
          <button
            type="button"
            @click="$emit('update:showApiKey', !showApiKey)"
            class="text-xs text-blue-600 hover:text-blue-800"
            v-if="formData.OPENAI_API_KEY || !envDefaults.OPENAI_API_KEY"
          >
            {{ showApiKey ? 'Hide' : 'Show' }} API Key
          </button>
          <p class="text-xs text-gray-500">Required for AI features</p>
        </div>
      </div>
      
      <div>
        <label for="llmModel" class="block text-sm font-medium text-gray-700 mb-2">
          LLM Model
        </label>
        <select
          id="llmModel"
          v-model="formData.LLM_MODEL"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="gpt-5-mini">GPT-5 Mini (Recommended)</option>
          <option value="gpt-5">GPT-5</option>
        </select>
        <p class="text-xs text-gray-500 mt-1">
          {{ envDefaults.LLM_MODEL ? 'Override .env value or leave blank to use default' : 'Choose your preferred model' }}
        </p>
      </div>
      
      <div>
        <label for="maxCompletionTokens" class="block text-sm font-medium text-gray-700 mb-2">
          Max Completion Tokens
        </label>
        <input
          id="maxCompletionTokens"
          v-model.number="formData.OPENAI_MAX_COMPLETION_TOKENS"
          type="number"
          min="1000"
          max="128000"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          :placeholder="envDefaults.OPENAI_MAX_COMPLETION_TOKENS ? 'Using .env value' : '6000'"
        />
        <p class="text-xs text-gray-500 mt-1">
          {{ envDefaults.OPENAI_MAX_COMPLETION_TOKENS ? 'Override .env value or leave blank to use default' : 'Range: 1000-128000 tokens' }}
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