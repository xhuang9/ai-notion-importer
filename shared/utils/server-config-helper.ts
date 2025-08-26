interface Settings {
  OPENAI_API_KEY?: string
  NOTION_API_KEY?: string
  NOTION_DATABASE_ID?: string
  LLM_MODEL?: string
  OPENAI_MAX_COMPLETION_TOKENS?: number
}

/**
 * Get merged configuration from environment variables and request headers
 * Environment variables take precedence over localStorage values sent via headers
 */
export function getMergedConfig(event: any): Settings {
  let config: any = {}
  
  try {
    config = useRuntimeConfig()
  } catch (error) {
    console.warn('useRuntimeConfig not available, using empty config:', error)
    config = {}
  }
  
  // Get localStorage settings from custom headers if provided
  const localStorageSettings = getLocalStorageSettingsFromHeaders(event)
  
  return {
    OPENAI_API_KEY: config?.private?.openaiApiKey || localStorageSettings.OPENAI_API_KEY,
    NOTION_API_KEY: config?.private?.notionApiKey || localStorageSettings.NOTION_API_KEY,
    NOTION_DATABASE_ID: config?.private?.notionDatabaseId || localStorageSettings.NOTION_DATABASE_ID,
    LLM_MODEL: config?.private?.llmModel || localStorageSettings.LLM_MODEL || 'gpt-5-mini',
    OPENAI_MAX_COMPLETION_TOKENS: config?.private?.openaiMaxCompletionTokens || localStorageSettings.OPENAI_MAX_COMPLETION_TOKENS || 6000
  }
}

/**
 * Extract localStorage settings from request headers
 */
function getLocalStorageSettingsFromHeaders(event: any): Settings {
  try {
    let settingsHeader: string | undefined
    
    try {
      settingsHeader = getHeader(event, 'x-localStorage-settings')
    } catch (error) {
      console.warn('getHeader not available, checking event headers directly')
      settingsHeader = event?.node?.req?.headers?.['x-localStorage-settings']
    }
    
    if (settingsHeader) {
      return JSON.parse(settingsHeader)
    }
  } catch (error) {
    console.warn('Failed to parse localStorage settings from headers:', error)
  }
  
  return {}
}

/**
 * Validate that all required settings are available
 */
export function validateRequiredSettings(settings: Settings): { isValid: boolean; missing: string[] } {
  const required = ['OPENAI_API_KEY', 'NOTION_API_KEY', 'NOTION_DATABASE_ID']
  const missing: string[] = []
  
  for (const key of required) {
    if (!settings[key as keyof Settings]) {
      missing.push(key)
    }
  }
  
  return {
    isValid: missing.length === 0,
    missing
  }
}