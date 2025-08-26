/**
 * Shared state management for PlanReview and its sub-components
 * Minimizes prop drilling by centralizing plan review state
 */

export const usePlanReviewState = () => {
  // Current operations state
  const operations = ref<OperationPlan[]>([])
  const reasoning = ref<string>('')
  const generalWarnings = ref<string[]>([])
  const isExecuting = ref(false)

  // Modal states
  const showEditModal = ref(false)
  const showActionEditor = ref(false)
  const showLLMPrompt = ref(false)
  
  // Editing state
  const editingIndex = ref(-1)
  const editingOperation = ref<OperationPlan | null>(null)
  
  // Edit form data
  const editForm = ref({
    name: '',
    status: 'Not Started',
    priority: 'Medium',
    due: '',
    rank: 50,
    tagsString: '',
    notes: ''
  })

  // Computed properties
  const approvedCount = computed(() => 
    operations.value.filter(op => op.approved).length
  )

  const hasOperations = computed(() => operations.value.length > 0)
  const allApproved = computed(() => approvedCount.value === operations.value.length && hasOperations.value)

  // Actions
  const updateOperations = (newOperations: OperationPlan[]) => {
    operations.value = newOperations
  }

  const approveAll = () => {
    operations.value = operations.value.map(op => ({ ...op, approved: true }))
  }

  const toggleAllApproval = () => {
    const shouldApprove = !allApproved.value
    operations.value = operations.value.map(op => ({ ...op, approved: shouldApprove }))
  }

  const startEdit = (index: number) => {
    const operation = operations.value[index]
    if (!operation) return
    
    editingIndex.value = index
    editingOperation.value = operation
    showActionEditor.value = true
  }

  const cancelEdit = () => {
    showEditModal.value = false
    showActionEditor.value = false
    editingIndex.value = -1
    editingOperation.value = null
  }

  const saveEdit = (updatedOperation: OperationPlan) => {
    if (editingIndex.value >= 0) {
      const updated = [...operations.value]
      updated[editingIndex.value] = updatedOperation
      updateOperations(updated)
      cancelEdit()
    }
  }

  const deleteOperation = (index: number) => {
    if (confirm('Are you sure you want to delete this operation?')) {
      const updated = operations.value.filter((_, i) => i !== index)
      updateOperations(updated)
    }
  }

  const getApprovedOperations = () => {
    return operations.value.filter(op => op.approved)
  }

  // Initialize from props
  const initialize = (props: {
    operations: OperationPlan[]
    reasoning?: string
    generalWarnings?: string[]
    isExecuting?: boolean
  }) => {
    operations.value = props.operations || []
    reasoning.value = props.reasoning || ''
    generalWarnings.value = props.generalWarnings || []
    isExecuting.value = props.isExecuting || false
  }

  return {
    // State
    operations: readonly(operations),
    reasoning: readonly(reasoning),
    generalWarnings: readonly(generalWarnings),
    isExecuting: readonly(isExecuting),
    
    // Modal states
    showEditModal,
    showActionEditor,
    showLLMPrompt,
    
    // Editing state
    editingIndex: readonly(editingIndex),
    editingOperation: readonly(editingOperation),
    editForm,
    
    // Computed
    approvedCount,
    hasOperations,
    allApproved,
    
    // Actions
    initialize,
    updateOperations,
    approveAll,
    toggleAllApproval,
    startEdit,
    cancelEdit,
    saveEdit,
    deleteOperation,
    getApprovedOperations
  }
}