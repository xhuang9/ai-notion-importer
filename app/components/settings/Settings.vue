<template>
  <div class="space-y-6">
    <SettingsConfigStatus :config-status="configStatus" />
    <SettingsSecurityWarning />

    <form @submit.prevent="handleSave" class="space-y-6">
      <SettingsOpenAISection 
        :form-data="formData" 
        :env-defaults="envDefaults" 
        :show-api-key="showApiKeys.openai"
        @update:show-api-key="showApiKeys.openai = $event"
      />

      <SettingsNotionSection 
        :form-data="formData" 
        :env-defaults="envDefaults" 
        :show-api-key="showApiKeys.notion"
        @update:show-api-key="showApiKeys.notion = $event"
      />

      <SettingsValidationErrors :errors="validationErrors" />

      <SettingsActionButtons 
        :has-stored-settings="hasStoredSettings"
        :is-testing-connection="isTestingConnection"
        :has-validation-errors="validationErrors.length > 0"
        @clear-settings="clearAllSettings"
        @test-connection="testConnection"
        @cancel="$emit('cancel')"
      />
    </form>

    <SettingsConnectionTest :connection-test-result="connectionTestResult" />
  </div>
</template>

<script setup lang="ts">
interface Emits {
  save: []
  cancel: []
}

const emit = defineEmits<Emits>()

// Use the composable for all form logic
const {
  formData,
  showApiKeys,
  validationErrors,
  isTestingConnection,
  connectionTestResult,
  envDefaults,
  configStatus,
  hasStoredSettings,
  loadFromLocalStorage,
  saveToLocalStorage,
  validateForm,
  testConnection,
  clearAllSettings,
  initializeEnvDefaults
} = useSettingsForm()

// Initialize on mount
onMounted(async () => {
  await initializeEnvDefaults()
  loadFromLocalStorage()
  validateForm()
})

// Watch for changes to validate form
watch(formData, validateForm, { deep: true })

// Event handlers
function handleSave() {
  if (validationErrors.value.length > 0) return
  
  saveToLocalStorage()
  emit('save')
}
</script>