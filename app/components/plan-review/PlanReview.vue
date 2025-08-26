<template>
  <div class="card">
    <PlanReviewHeader
      :approved-count="operationsManager.approvedCount.value"
      :total-operations="operations.length"
      :all-approved="operationsManager.approvedCount.value === operations.length"
      :is-executing="isExecuting"
      @llm-update="actionsManager.openLLMPrompt"
      @approve-all="operationsManager.approveAll"
      @execute="operationsManager.executeApprovedOperations"
    />

    <PlanReviewInfoCards
      :reasoning="reasoning"
      :general-warnings="generalWarnings"
    />

    <PlanReviewOperationsTable
      :operations="operations"
      :approved-count="operationsManager.approvedCount.value"
      :all-approved="operationsManager.approvedCount.value === operations.length"
      @toggle-all-approval="operationsManager.toggleAllApproval"
      @toggle-operation-approval="toggleOperationApproval"
      @edit-operation="handleEditOperation"
      @delete-operation="operationsManager.deleteOperation"
    />

    <PlanReviewEditModal
      :is-visible="actionsManager.showEditModal.value"
      :edit-form="actionsManager.editForm.value"
      @save="handleSaveEdit"
      @cancel="actionsManager.closeEditModal"
    />

    <!-- Action Editor -->
    <ActionEditor
      v-if="actionsManager.showActionEditor.value && actionsManager.editingOperation.value"
      :operation="actionsManager.editingOperation.value"
      :index="actionsManager.editingIndex.value"
      :is-visible="actionsManager.showActionEditor.value"
      @save="handleActionEditorSave"
      @cancel="handleActionEditorCancel"
      @close="handleActionEditorCancel"
    />

    <!-- LLM Prompt Window -->
    <LLMPromptWindow
      :is-visible="actionsManager.showLLMPrompt.value"
      :operations="operations"
      :system-prompts="activeSystemPrompts"
      @update="handleLLMPromptUpdate"
      @close="handleLLMPromptClose"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  operations: OperationPlan[]
  reasoning?: string
  generalWarnings?: string[]
  isExecuting?: boolean
}>(), {
  operations: () => [],
  reasoning: '',
  generalWarnings: () => [],
  isExecuting: false
})

const emit = defineEmits<{
  execute: [operations: OperationPlan[]]
  update: [operations: OperationPlan[]]
}>()

// Get system prompts for LLM updates
const { getActiveSystemPrompts } = useSystemPrompts()
const activeSystemPrompts = computed(() => getActiveSystemPrompts())

// Use composables for state management
const actionsManager = usePlanReviewActions()
const operationsManager = usePlanReviewOperations(computed(() => props.operations), emit)

// Event handlers
const toggleOperationApproval = (index: number) => {
  const updated = [...props.operations]
  const operation = updated[index]
  if (operation) {
    updated[index] = { ...operation, approved: !operation.approved }
    emit('update', updated)
  }
}

const handleEditOperation = (index: number) => {
  const operation = props.operations[index]
  if (!operation) return
  
  actionsManager.openEditModal(operation, index)
}

const handleSaveEdit = (formData: any) => {
  operationsManager.saveEditedOperation(actionsManager.editingIndex.value, formData)
  actionsManager.closeEditModal()
}

// Action Editor handlers
const handleActionEditorSave = (updatedOperation: OperationPlan) => {
  operationsManager.updateOperation(actionsManager.editingIndex.value, updatedOperation)
  actionsManager.closeActionEditor()
}

const handleActionEditorCancel = () => {
  actionsManager.closeActionEditor()
}

// LLM Prompt handlers
const handleLLMPromptUpdate = (updatedOperations: OperationPlan[]) => {
  emit('update', updatedOperations)
  actionsManager.closeLLMPrompt()
}

const handleLLMPromptClose = () => {
  actionsManager.closeLLMPrompt()
}

// Dynamic field display helpers (using shared utilities)
// These functions are auto-imported from ~/shared/utils/fieldHelpers.ts
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>