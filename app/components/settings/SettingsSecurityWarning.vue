<template>
  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
    <div class="flex items-start">
      <svg class="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      <div class="text-sm">
        <p class="font-medium text-yellow-800">Security Notice</p>
        <p class="text-yellow-700 mt-1">
          API keys are stored locally in your browser and never sent to external servers except the official APIs. 
          <strong>Remove API keys after use if this device is shared with others.</strong>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props or logic needed for this static warning component
</script>