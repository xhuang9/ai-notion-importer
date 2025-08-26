export const usePlanReviewActions = () => {
  const showEditModal = ref(false)
  const showActionEditor = ref(false)
  const showLLMPrompt = ref(false)
  const editingIndex = ref(-1)
  const editingOperation = ref<OperationPlan | null>(null)
  
  const editForm = ref({
    name: '',
    status: 'Not Started',
    priority: 'Medium',
    due: '',
    rank: 50,
    tagsString: '',
    notes: ''
  })

  const openEditModal = (operation: OperationPlan, index: number) => {
    editForm.value = {
      name: operation.fields.name || '',
      status: operation.fields.status || 'Not Started',
      priority: operation.fields.priority || 'Medium',
      due: operation.fields.due || '',
      rank: operation.fields.rank || 50,
      tagsString: Array.isArray(operation.fields.tags) 
        ? operation.fields.tags.join(', ') 
        : '',
      notes: operation.fields.notes || ''
    }
    editingIndex.value = index
    showEditModal.value = true
  }

  const closeEditModal = () => {
    showEditModal.value = false
    editingIndex.value = -1
  }

  const openActionEditor = (operation: OperationPlan, index: number) => {
    editingOperation.value = operation
    editingIndex.value = index
    showActionEditor.value = true
  }

  const closeActionEditor = () => {
    showActionEditor.value = false
    editingOperation.value = null
    editingIndex.value = -1
  }

  const openLLMPrompt = () => {
    showLLMPrompt.value = true
  }

  const closeLLMPrompt = () => {
    showLLMPrompt.value = false
  }

  return {
    // State
    showEditModal: readonly(showEditModal),
    showActionEditor: readonly(showActionEditor),
    showLLMPrompt: readonly(showLLMPrompt),
    editingIndex: readonly(editingIndex),
    editingOperation,
    editForm: readonly(editForm),
    
    // Actions
    openEditModal,
    closeEditModal,
    openActionEditor,
    closeActionEditor,
    openLLMPrompt,
    closeLLMPrompt
  }
}