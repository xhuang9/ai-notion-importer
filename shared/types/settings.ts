export interface SettingsData {
  OPENAI_API_KEY: string
  NOTION_API_KEY: string
  NOTION_DATABASE_ID: string
  LLM_MODEL: string
  OPENAI_MAX_COMPLETION_TOKENS: number
}

export interface EnvDefaults {
  OPENAI_API_KEY: boolean | null
  NOTION_API_KEY: boolean | null
  NOTION_DATABASE_ID: boolean | null
  LLM_MODEL: string | null
  OPENAI_MAX_COMPLETION_TOKENS: number | null
}

export interface TestConnectionRequest {
  OPENAI_API_KEY: string
  NOTION_API_KEY: string
  NOTION_DATABASE_ID: string
  LLM_MODEL: string
}

export interface TestConnectionResponse {
  success: boolean
  message: string
  results: Array<{
    service: string
    success: boolean
    message: string
  }>
}