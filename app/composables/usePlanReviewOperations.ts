export const usePlanReviewOperations = (
  operations: ComputedRef<OperationPlan[]>,
  emit: any
) => {
  const approvedCount = computed(() => 
    operations.value.filter(op => op.approved).length
  )

  const approveAll = () => {
    const updated = operations.value.map(op => ({ ...op, approved: true }))
    emit('update', updated)
  }

  const toggleAllApproval = () => {
    const allApproved = approvedCount.value === operations.value.length
    const updated = operations.value.map(op => ({ ...op, approved: !allApproved }))
    emit('update', updated)
  }

  const executeApprovedOperations = () => {
    const approved = operations.value.filter(op => op.approved)
    emit('execute', approved)
  }

  const deleteOperation = (index: number) => {
    if (confirm('Are you sure you want to delete this operation?')) {
      const updated = operations.value.filter((_, i) => i !== index)
      emit('update', updated)
    }
  }

  const saveEditedOperation = (index: number, editForm: any) => {
    if (index >= 0) {
      const updated = [...operations.value]
      const existingOperation = updated[index]
      if (!existingOperation) return
      
      const tags = editForm.tagsString.split(',').map((t: string) => t.trim()).filter((t: string) => t)
      
      updated[index] = {
        ...existingOperation,
        fields: {
          ...existingOperation.fields,
          name: editForm.name,
          status: editForm.status as any,
          priority: editForm.priority as any,
          due: editForm.due || null,
          rank: editForm.rank,
          tags: tags as string[],
          notes: editForm.notes
        },
        edited: true
      }
      emit('update', updated)
    }
  }

  const updateOperation = (index: number, updatedOperation: OperationPlan) => {
    if (index >= 0) {
      const updated = [...operations.value]
      updated[index] = updatedOperation
      emit('update', updated)
    }
  }

  return {
    approvedCount,
    approveAll,
    toggleAllApproval,
    executeApprovedOperations,
    deleteOperation,
    saveEditedOperation,
    updateOperation
  }
}