<template>
  <div 
    v-if="connectionTestResult" 
    class="mt-4 p-3 rounded-md" 
    :class="connectionTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'"
  >
    <div class="flex items-start">
      <svg 
        class="w-5 h-5 mt-0.5 mr-2" 
        :class="connectionTestResult.success ? 'text-green-600' : 'text-red-600'" 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path 
          v-if="connectionTestResult.success" 
          fill-rule="evenodd" 
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
          clip-rule="evenodd" 
        />
        <path 
          v-else 
          fill-rule="evenodd" 
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
          clip-rule="evenodd" 
        />
      </svg>
      <div class="text-sm">
        <p 
          class="font-medium" 
          :class="connectionTestResult.success ? 'text-green-800' : 'text-red-800'"
        >
          {{ connectionTestResult.success ? 'Connection Successful' : 'Connection Failed' }}
        </p>
        <p :class="connectionTestResult.success ? 'text-green-700' : 'text-red-700'">
          {{ connectionTestResult.message }}
        </p>
        
        <!-- Show detailed results if available -->
        <div v-if="connectionTestResult.results && connectionTestResult.results.length > 0" class="mt-2 space-y-1">
          <div v-for="result in connectionTestResult.results" :key="result.service" class="text-xs">
            <span class="font-medium">{{ result.service }}:</span>
            <span :class="result.success ? 'text-green-600' : 'text-red-600'" class="ml-1">
              {{ result.message }}
            </span>
          </div>
        </div>
        
        <p class="text-xs mt-2 opacity-75" :class="connectionTestResult.success ? 'text-green-600' : 'text-red-600'">
          Tested with current form values
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  connectionTestResult: TestConnectionResponse | null
}

defineProps<Props>()
</script>