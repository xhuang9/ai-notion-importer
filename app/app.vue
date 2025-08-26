<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">{{ $config.public.appName }}</h1>
          </div>
          
          <div class="flex items-center gap-4">
            <button
              @click="showSettings = true"
              class="px-4 py-2 cursor-pointer rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              :class="{ 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200': !hasValidConfig, 'bg-gray-200 text-gray-800 hover:bg-gray-300': hasValidConfig }"
              :title="hasValidConfig ? 'Configure API keys and settings' : 'Configuration required'"
            >
              Settings
              <span v-if="!hasValidConfig" class="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                Config Required
              </span>
            </button>
            
            <button
              @click="showSystemPrompts = !showSystemPrompts"
              class="px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              :class="{ 'bg-blue-100 text-blue-800 hover:bg-blue-200': showSystemPrompts, 'bg-gray-200 text-gray-800 hover:bg-gray-300' : !showSystemPrompts }"
            >
              System Prompts
              <span v-if="activePromptCount > 0" class="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {{ activePromptCount }} active
              </span>
            </button>
            
            <button
              v-if="currentPlan"
              @click="clearCurrentPlan"
              class="text-red-600 hover:text-red-800 text-sm"
            >
              Clear Plan
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- System Prompts Management -->
      <div v-if="showSystemPrompts" class="mb-8">
        <SystemPrompts @update="handleSystemPromptsUpdate" />
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 gap-8">
        <!-- Form Section -->
        <div v-if="!currentPlan">
          <MainForm @submit="handleFormSubmit" ref="mainForm" />
        </div>

        <!-- Plan Review Section -->
        <div v-else>
          <PlanReview
            :operations="currentPlan.operations"
            :reasoning="currentPlan.reasoning"
            :general-warnings="currentPlan.warnings"
            :is-executing="isExecuting"
            @execute="handleExecutePlan"
            @update="handlePlanUpdate"
          />

          <!-- Execution Results -->
          <div v-if="executionResults" class="mt-8 card">
            <h3 class="text-xl font-bold mb-4">Execution Results</h3>
            
            <div class="mb-4 p-4 rounded-lg"
              :class="executionResults.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'"
            >
              <div class="flex items-center mb-2">
                <svg 
                  class="w-5 h-5 mr-2"
                  :class="executionResults.success ? 'text-green-600' : 'text-red-600'"
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    v-if="executionResults.success"
                    fill-rule="evenodd" 
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                    clip-rule="evenodd" 
                  />
                  <path 
                    v-else
                    fill-rule="evenodd" 
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                    clip-rule="evenodd" 
                  />
                </svg>
                <span class="font-semibold"
                  :class="executionResults.success ? 'text-green-800' : 'text-red-800'"
                >
                  {{ executionResults.success ? 'Execution Completed Successfully' : 'Execution Completed with Errors' }}
                </span>
              </div>
              
              <div class="text-sm"
                :class="executionResults.success ? 'text-green-700' : 'text-red-700'"
              >
                {{ executionResults.summary.successful }}/{{ executionResults.summary.total }} operations successful
                <span v-if="executionResults.summary.failed > 0">
                  • {{ executionResults.summary.failed }} failed
                </span>
              </div>
            </div>

            <!-- Detailed Results -->
            <div class="space-y-3">
              <div
                v-for="result in executionResults.results"
                :key="result.operation.id"
                class="p-3 rounded border"
                :class="result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="font-medium">{{ getMainFieldValue(result.operation.fields) }}</h4>
                    <p class="text-sm text-gray-600">{{ result.operation.kind }} operation</p>
                  </div>
                  <div class="text-right">
                    <span 
                      class="px-2 py-1 text-xs rounded-full"
                      :class="result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    >
                      {{ result.success ? 'Success' : 'Failed' }}
                    </span>
                  </div>
                </div>
                
                <div v-if="result.error" class="mt-2 text-sm text-red-600">
                  Error: {{ result.error }}
                </div>
                
                <div v-if="result.notionPageId" class="mt-2 text-xs text-gray-500">
                  Notion Page ID: {{ result.notionPageId }}
                </div>
              </div>
            </div>

            <div class="mt-6 flex justify-center">
              <button @click="startNewPlan" class="btn-primary">
                Create Another Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Modal -->
      <SettingsModal
        :is-visible="showSettings"
        @close="showSettings = false"
        @saved="handleSettingsSaved"
      />

      <!-- Loading Overlay -->
      <div 
        v-if="isGeneratingPlan"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 class="text-lg font-semibold mb-2">Notion update actions</h3>
            <p class="text-gray-600 text-sm">
              Processing your request and attached files...
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Composables
const { getActiveSystemPrompts } = useSystemPrompts()
const { getCurrentPlanSession, savePlanSession, clearPlanSession, createPlanSession } = usePlanSession()
const { hasValidConfig, checkConfiguration, showSecurityReminder } = useConfiguration()

// State
const showSystemPrompts = ref(false)
const showSettings = ref(false)
const activePromptCount = ref(0)
const currentPlan = ref<PlanSession | null>(null)
const isGeneratingPlan = ref(false)
const isExecuting = ref(false)
const executionResults = ref<any>(null)
const mainForm = ref()

// Load initial data
const loadActivePrompts = () => {
  const activePrompts = getActiveSystemPrompts()
  activePromptCount.value = activePrompts.length
}

const loadCurrentPlan = () => {
  currentPlan.value = getCurrentPlanSession()
}


// Event handlers
const handleSystemPromptsUpdate = () => {
  loadActivePrompts()
}

const handleSettingsSaved = () => {
  checkConfiguration()
  // Show security reminder when settings are saved
  showSecurityReminder()
}

const handleFormSubmit = async (data: { prompt: string; files: File[]; systemPrompts: SystemPrompt[] }) => {
  isGeneratingPlan.value = true
  executionResults.value = null

  try {
    // Process files
    const processedFiles = await FileProcessor.processFiles(data.files)

    // Create form data for API call
    const requestData = {
      prompt: data.prompt,
      files: processedFiles.map((f: ProcessedFile) => ({
        name: f.name,
        type: f.type,
        content: f.type.startsWith('image/') ? f.metadata.dataUrl : f.content,
        size: f.metadata.size,
        metadata: f.metadata
      })),
      systemPrompts: data.systemPrompts
    }

    // Call API to generate plan
    const response = await $fetchWithSettings('/api/generate-plan', {
      method: 'POST',
      body: requestData
    }) as any

    if (response.success) {
      // Create and save plan session
      const planSession = createPlanSession(data.prompt, data.files)
      planSession.operations = response.plan
      planSession.reasoning = response.reasoning
      planSession.warnings = response.warnings || []
      
      savePlanSession(planSession)
      currentPlan.value = planSession

      // Reset form
      if (mainForm.value) {
        mainForm.value.resetForm()
      }
    } else {
      throw new Error('Failed to generate plan')
    }

  } catch (error) {
    console.error('Plan generation error:', error)
    alert('Failed to generate plan. Please try again.')
  } finally {
    isGeneratingPlan.value = false
  }
}

const handlePlanUpdate = (updatedOperations: OperationPlan[]) => {
  if (currentPlan.value) {
    currentPlan.value.operations = updatedOperations
    savePlanSession(currentPlan.value)
  }
}

const handleExecutePlan = async (operations: OperationPlan[]) => {
  isExecuting.value = true

  try {
    const response = await $fetchWithSettings('/api/execute-plan', {
      method: 'POST',
      body: { operations }
    }) as any

    executionResults.value = response

    if (response.success) {
      // Clear plan session on successful execution
      clearPlanSession()
      currentPlan.value = null
    }

  } catch (error) {
    console.error('Plan execution error:', error)
    alert('Failed to execute plan. Please try again.')
  } finally {
    isExecuting.value = false
  }
}

const clearCurrentPlan = () => {
  if (confirm('Are you sure you want to clear the current plan? All unsaved changes will be lost.')) {
    clearPlanSession()
    currentPlan.value = null
    executionResults.value = null
  }
}

const startNewPlan = () => {
  executionResults.value = null
  clearPlanSession()
  currentPlan.value = null
}

// Dynamic field display helper
const getMainFieldValue = (fields: any): string => {
  return fields.name || fields.title || fields.Name || fields.Title || 
         Object.values(fields)[0] as string || 'Untitled'
}

// Initialize
onMounted(() => {
  loadActivePrompts()
  loadCurrentPlan()
  checkConfiguration()

  // Listen for storage changes
  window.addEventListener('storage', () => {
    loadActivePrompts()
    checkConfiguration()
  })
})

onUnmounted(() => {
  window.removeEventListener('storage', loadActivePrompts)
})

// SEO
useHead({
  title: 'AI Notion Importer - AI-Powered Task Management',
  meta: [
    { name: 'description', content: 'Transform prompts and files into structured Notion database operations using AI' }
  ]
})
</script>
