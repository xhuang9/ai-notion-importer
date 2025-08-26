import tailwind from '@tailwindcss/vite'

const environment = process.env.ENV || "dev";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  css: ['~/assets/css/main.css'],
  
  modules: [
    '@vite-pwa/nuxt'
  ],
  
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
  },
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
    },
    manifest: {
      name: 'AI Notion Importer',
      short_name: 'AI Notion',
      description: 'Transform natural language prompts and file attachments into structured Notion database operations using AI',
      theme_color: '#000000',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      categories: ['productivity', 'utilities'],
      icons: [
        {
          src: 'pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png'
        },
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: 'maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
    devOptions: {
      enabled: false, // Disable PWA in development to avoid service worker errors
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    }
  },
  nitro: {
    preset: environment === "production" ? "netlify_edge" : "node-server",
  }
})
