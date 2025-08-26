/**
 * Get localStorage settings
 */
export function getLocalStorageSettings(): Record<string, any> {
  try {
    const stored = localStorage.getItem('ai-notion-importer-settings')
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error)
    return {}
  }
}

/**
 * Enhanced $fetch that automatically includes localStorage settings in headers
 */
export async function $fetchWithSettings(url: string, options: any = {}) {
  const settings = getLocalStorageSettings()
  
  // Add localStorage settings to headers
  const headers = {
    ...options.headers,
    'x-localStorage-settings': JSON.stringify(settings)
  }
  
  return $fetch(url, {
    ...options,
    headers
  })
}

/**
 * Check if we have valid configuration (env + localStorage)
 */
export async function hasValidConfiguration(): Promise<boolean> {
  try {
    const localSettings = getLocalStorageSettings()
    const envDefaults = await $fetch('/api/settings/env-defaults').catch(() => ({})) as any
    
    const hasOpenAI = localSettings.OPENAI_API_KEY || envDefaults.OPENAI_API_KEY
    const hasNotion = localSettings.NOTION_API_KEY || envDefaults.NOTION_API_KEY
    const hasDatabase = localSettings.NOTION_DATABASE_ID || envDefaults.NOTION_DATABASE_ID
    
    return !!(hasOpenAI && hasNotion && hasDatabase)
  } catch (error) {
    console.warn('Failed to check configuration:', error)
    return false
  }
}