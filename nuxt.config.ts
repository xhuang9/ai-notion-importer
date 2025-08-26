import tailwind from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  css: ['~/assets/css/main.css'],
  
  vite: {
    plugins: [tailwind()]
  },
  
  runtimeConfig: {
    private: {
      openaiApiKey: process.env.OPENAI_API_KEY,
      notionApiKey: process.env.NOTION_API_KEY,
      notionDatabaseId: process.env.NOTION_DATABASE_ID,
      llmModel: process.env.LLM_MODEL || 'gpt-5-mini',
      openaiMaxCompletionTokens: parseInt(process.env.OPENAI_MAX_COMPLETION_TOKENS || '4000'),
    },
    public: {
      appName: 'AI Notion Importer'
    }
  }
})
