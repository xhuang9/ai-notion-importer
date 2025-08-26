export const getOperationTypeClass = (kind: string) => {
  const classes = {
    create: 'bg-green-100 text-green-800',
    update: 'bg-blue-100 text-blue-800',
    status_change: 'bg-yellow-100 text-yellow-800'
  }
  return classes[kind as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

export const getPriorityClass = (priority: string) => {
  const classes = {
    Low: 'bg-gray-100 text-gray-800',
    Medium: 'bg-blue-100 text-blue-800',
    High: 'bg-orange-100 text-orange-800',
    Urgent: 'bg-red-100 text-red-800'
  }
  return classes[priority as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

export const getConfidenceClass = (confidence: number) => {
  if (confidence >= 80) return 'bg-green-500'
  if (confidence >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

export const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}