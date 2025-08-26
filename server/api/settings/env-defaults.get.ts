export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Return which environment variables are set (without exposing the actual values)
  return {
    OPENAI_API_KEY: config.private.openaiApiKey ? true : null,
    NOTION_API_KEY: config.private.notionApiKey ? true : null,
    NOTION_DATABASE_ID: config.private.notionDatabaseId ? true : null,
    LLM_MODEL: config.private.llmModel || null,
    OPENAI_MAX_COMPLETION_TOKENS: config.private.openaiMaxCompletionTokens || null
  }
})