export const useSettingsForm = () => {
  // Reactive state
  const formData = ref<SettingsData>({
    OPENAI_API_KEY: '',
    NOTION_API_KEY: '',
    NOTION_DATABASE_ID: '',
    LLM_MODEL: 'gpt-5-mini',
    OPENAI_MAX_COMPLETION_TOKENS: 6000
  })

  const showApiKeys = ref({
    openai: false,
    notion: false
  })

  const validationErrors = ref<string[]>([])
  const isTestingConnection = ref(false)
  const connectionTestResult = ref<TestConnectionResponse | null>(null)
  const envDefaults = ref<Partial<EnvDefaults>>({})

  // Configuration status computed
  const configStatus = computed(() => {
    const hasRequiredSettings = (formData.value.OPENAI_API_KEY || envDefaults.value.OPENAI_API_KEY) &&
      (formData.value.NOTION_API_KEY || envDefaults.value.NOTION_API_KEY) &&
      (formData.value.NOTION_DATABASE_ID || envDefaults.value.NOTION_DATABASE_ID)

    if (hasRequiredSettings) {
      const source = Object.keys(envDefaults.value).length > 0 ? '.env file and localStorage' : 'localStorage'
      return {
        type: 'success' as const,
        title: 'Configuration Complete',
        description: `All required settings are configured using ${source}`,
        bgClass: 'bg-green-50 border border-green-200',
        iconClass: 'text-green-600',
        textClass: 'text-green-800',
        descClass: 'text-green-700'
      }
    } else {
      return {
        type: 'warning' as const,
        title: 'Configuration Required',
        description: 'Please configure all required API keys and settings to use the application',
        bgClass: 'bg-yellow-50 border border-yellow-200',
        iconClass: 'text-yellow-600',
        textClass: 'text-yellow-800',
        descClass: 'text-yellow-700'
      }
    }
  })

  const hasStoredSettings = computed(() => {
    return Object.keys(formData.value).some(key => 
      formData.value[key as keyof SettingsData] && 
      formData.value[key as keyof SettingsData] !== getDefaultValue(key as keyof SettingsData)
    )
  })

  // Utility functions
  function getDefaultValue(key: keyof SettingsData): string | number {
    const defaults: SettingsData = {
      OPENAI_API_KEY: '',
      NOTION_API_KEY: '',
      NOTION_DATABASE_ID: '',
      LLM_MODEL: 'gpt-5-mini',
      OPENAI_MAX_COMPLETION_TOKENS: 6000
    }
    return defaults[key]
  }

  // Load and save functions
  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('ai-notion-importer-settings')
      if (stored) {
        const parsedSettings = JSON.parse(stored) as Partial<SettingsData>
        Object.assign(formData.value, parsedSettings)
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error)
    }
  }

  const saveToLocalStorage = () => {
    try {
      // Only save non-empty values that aren't covered by .env
      const settingsToSave: Partial<SettingsData> = {}
      
      Object.entries(formData.value).forEach(([key, value]) => {
        const envKey = key as keyof SettingsData
        const hasEnvValue = envKey in envDefaults.value && envDefaults.value[envKey as keyof EnvDefaults]
        if (value && !hasEnvValue) {
          (settingsToSave as any)[envKey] = value
        }
      })
      
      localStorage.setItem('ai-notion-importer-settings', JSON.stringify(settingsToSave))
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error)
    }
  }

  // Validation
  const validateForm = () => {
    validationErrors.value = []
    
    // Check required fields (considering .env defaults)
    if (!formData.value.OPENAI_API_KEY && !envDefaults.value.OPENAI_API_KEY) {
      validationErrors.value.push('OpenAI API Key is required')
    }
    
    if (!formData.value.NOTION_API_KEY && !envDefaults.value.NOTION_API_KEY) {
      validationErrors.value.push('Notion API Key is required')
    }
    
    if (!formData.value.NOTION_DATABASE_ID && !envDefaults.value.NOTION_DATABASE_ID) {
      validationErrors.value.push('Notion Database ID is required')
    }
    
    // Validate token limits
    if (formData.value.OPENAI_MAX_COMPLETION_TOKENS < 1000 || formData.value.OPENAI_MAX_COMPLETION_TOKENS > 128000) {
      validationErrors.value.push('Max completion tokens must be between 1000 and 128000')
    }
  }

  // Connection testing
  const testConnection = async () => {
    isTestingConnection.value = true
    connectionTestResult.value = null
    
    try {
      const testData = {
        OPENAI_API_KEY: formData.value.OPENAI_API_KEY || 'env',
        NOTION_API_KEY: formData.value.NOTION_API_KEY || 'env',
        NOTION_DATABASE_ID: formData.value.NOTION_DATABASE_ID || 'env',
        LLM_MODEL: formData.value.LLM_MODEL || 'gpt-5-mini'
      }
      
      const response = await $fetchWithSettings('/api/settings/test-connection', {
        method: 'POST',
        body: testData
      }) as any
      
      connectionTestResult.value = {
        success: response.success,
        message: response.message || 'Connection test completed',
        results: response.results || []
      }
    } catch (error: any) {
      connectionTestResult.value = {
        success: false,
        message: error?.data?.message || error?.message || 'Connection test failed',
        results: []
      }
    } finally {
      isTestingConnection.value = false
    }
  }

  // Settings management
  const clearAllSettings = () => {
    if (confirm('Are you sure you want to clear all stored settings? This will remove all API keys and configuration from your browser.')) {
      try {
        localStorage.removeItem('ai-notion-importer-settings')
        
        // Reset form data (but keep .env defaults)
        formData.value = {
          OPENAI_API_KEY: '',
          NOTION_API_KEY: '',
          NOTION_DATABASE_ID: '',
          LLM_MODEL: 'gpt-5-mini',
          OPENAI_MAX_COMPLETION_TOKENS: 6000
        }
        
        connectionTestResult.value = null
        showApiKeys.value = { openai: false, notion: false }
      } catch (error) {
        console.error('Failed to clear settings:', error)
      }
    }
  }

  // Initialize environment defaults
  const initializeEnvDefaults = async () => {
    try {
      const response = await $fetch('/api/settings/env-defaults')
      envDefaults.value = response || {}
    } catch (error) {
      console.warn('Could not load environment defaults:', error)
    }
  }

  return {
    // State
    formData,
    showApiKeys,
    validationErrors,
    isTestingConnection,
    connectionTestResult,
    envDefaults,
    
    // Computed
    configStatus,
    hasStoredSettings,
    
    // Methods
    loadFromLocalStorage,
    saveToLocalStorage,
    validateForm,
    testConnection,
    clearAllSettings,
    initializeEnvDefaults,
    getDefaultValue
  }
}