export const usePlanSession = () => {
  const STORAGE_KEY = 'current_plan_session'

  const getCurrentPlanSession = (): PlanSession | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Error reading plan session:', error)
      return null
    }
  }

  const savePlanSession = (session: PlanSession): void => {
    if (typeof window === 'undefined') return
    
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } catch (error) {
      console.error('Error saving plan session:', error)
    }
  }

  const clearPlanSession = (): void => {
    if (typeof window === 'undefined') return
    
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing plan session:', error)
    }
  }

  const createPlanSession = (prompt: string, files: File[]): PlanSession => {
    return {
      id: crypto.randomUUID(),
      operations: [],
      createdAt: new Date().toISOString(),
      originalPrompt: prompt,
      files: files.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size
      }))
    }
  }

  return {
    getCurrentPlanSession,
    savePlanSession,
    clearPlanSession,
    createPlanSession
  }
}