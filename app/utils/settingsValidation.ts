export interface SettingsValidationResult {
  isValid: boolean
  errors: string[]
}

export const validateSettingsData = (
  formData: SettingsData, 
  envDefaults: Partial<EnvDefaults>
): SettingsValidationResult => {
  const errors: string[] = []
  
  // Check required fields (considering .env defaults)
  if (!formData.OPENAI_API_KEY && !envDefaults.OPENAI_API_KEY) {
    errors.push('OpenAI API Key is required')
  }
  
  if (!formData.NOTION_API_KEY && !envDefaults.NOTION_API_KEY) {
    errors.push('Notion API Key is required')
  }
  
  if (!formData.NOTION_DATABASE_ID && !envDefaults.NOTION_DATABASE_ID) {
    errors.push('Notion Database ID is required')
  }
  
  // Validate token limits
  if (formData.OPENAI_MAX_COMPLETION_TOKENS < 1000 || formData.OPENAI_MAX_COMPLETION_TOKENS > 128000) {
    errors.push('Max completion tokens must be between 1000 and 128000')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const getDefaultSettingsData = (): SettingsData => ({
  OPENAI_API_KEY: '',
  NOTION_API_KEY: '',
  NOTION_DATABASE_ID: '',
  LLM_MODEL: 'gpt-5-mini',
  OPENAI_MAX_COMPLETION_TOKENS: 6000
})

export const shouldSaveToLocalStorage = (
  key: keyof SettingsData, 
  value: any, 
  envDefaults: Partial<EnvDefaults>
): boolean => {
  const hasEnvValue = key in envDefaults && envDefaults[key as keyof EnvDefaults]
  return value && !hasEnvValue
}

export const buildSettingsToSave = (
  formData: SettingsData, 
  envDefaults: Partial<EnvDefaults>
): Partial<SettingsData> => {
  const settingsToSave: Partial<SettingsData> = {}
  
  Object.entries(formData).forEach(([key, value]) => {
    const envKey = key as keyof SettingsData
    if (shouldSaveToLocalStorage(envKey, value, envDefaults)) {
      (settingsToSave as any)[envKey] = value
    }
  })
  
  return settingsToSave
}