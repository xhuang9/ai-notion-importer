/**
 * Configuration management composable
 * Provides configuration status and validation
 */
export const useConfiguration = () => {
  const hasValidConfig = ref(false)
  
  /**
   * Check if all required configuration is available
   */
  const checkConfiguration = async () => {
    try {
      // Check localStorage for settings
      const storedSettings = localStorage.getItem('ai-notion-importer-settings')
      const parsed = storedSettings ? JSON.parse(storedSettings) : {}
      
      // Check if we have environment defaults
      const envDefaults = await $fetch('/api/settings/env-defaults').catch(() => ({})) as EnvDefaults
      
      // Check if all required fields are available
      const hasOpenAI = parsed.OPENAI_API_KEY || envDefaults?.OPENAI_API_KEY
      const hasNotion = parsed.NOTION_API_KEY || envDefaults?.NOTION_API_KEY
      const hasDatabase = parsed.NOTION_DATABASE_ID || envDefaults?.NOTION_DATABASE_ID
      
      hasValidConfig.value = !!(hasOpenAI && hasNotion && hasDatabase)
    } catch (error) {
      console.warn('Failed to check configuration:', error)
      hasValidConfig.value = false
    }
  }
  
  /**
   * Show security reminder about API keys
   */
  const showSecurityReminder = () => {
    const lastReminder = localStorage.getItem('ai-notion-importer-security-reminder')
    const lastReminderTime = lastReminder ? new Date(lastReminder).getTime() : 0
    const dayInMs = 24 * 60 * 60 * 1000
    const now = new Date().getTime()
    
    // Show reminder if more than 1 day has passed or first time
    if (now - lastReminderTime > dayInMs) {
      const shouldRemind = confirm(
        '🔐 Security Reminder:\n\n' +
        'Your API keys are stored locally in your browser. This is generally secure, but remember:\n\n' +
        '• Remove API keys after use if this device is shared with others\n' +
        '• API keys are only sent to official OpenAI and Notion APIs\n' +
        '• Consider using environment variables for production deployments\n\n' +
        'Click OK to acknowledge this security notice.'
      )
      
      if (shouldRemind) {
        localStorage.setItem('ai-notion-importer-security-reminder', new Date().toISOString())
      }
    }
  }
  
  /**
   * Clear all stored settings and show confirmation
   */
  const clearAllSettings = () => {
    if (confirm('Are you sure you want to clear all stored settings? This will remove all API keys and configuration from your browser.')) {
      localStorage.removeItem('ai-notion-importer-settings')
      localStorage.removeItem('ai-notion-importer-security-reminder')
      checkConfiguration()
      return true
    }
    return false
  }
  
  return {
    hasValidConfig: readonly(hasValidConfig),
    checkConfiguration,
    showSecurityReminder,
    clearAllSettings
  }
}