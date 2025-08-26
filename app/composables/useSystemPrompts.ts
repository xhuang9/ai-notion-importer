
export const useSystemPrompts = () => {
  const STORAGE_KEY = 'system_prompts'

  const getSystemPrompts = (): SystemPrompt[] => {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error reading system prompts:', error)
      return []
    }
  }

  const saveSystemPrompts = (prompts: SystemPrompt[]): void => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts))
    } catch (error) {
      console.error('Error saving system prompts:', error)
    }
  }

  const createSystemPrompt = (name: string, content: string): SystemPrompt => {
    const now = new Date().toISOString()
    return {
      id: crypto.randomUUID(),
      name,
      content,
      active: true,
      order: Date.now(),
      createdAt: now,
      updatedAt: now
    }
  }

  const addSystemPrompt = (name: string, content: string): void => {
    const prompts = getSystemPrompts()
    const newPrompt = createSystemPrompt(name, content)
    prompts.push(newPrompt)
    saveSystemPrompts(prompts)
  }

  const updateSystemPrompt = (id: string, updates: Partial<SystemPrompt>): void => {
    const prompts = getSystemPrompts()
    const index = prompts.findIndex(p => p.id === id)
    if (index !== -1) {
      const existingPrompt = prompts[index]
      if (!existingPrompt) return
      
      const updatedPrompt: SystemPrompt = {
        ...existingPrompt,
        ...updates,
        id: existingPrompt.id,
        name: updates.name ?? existingPrompt.name,
        content: updates.content ?? existingPrompt.content,
        active: updates.active ?? existingPrompt.active,
        order: updates.order ?? existingPrompt.order,
        createdAt: updates.createdAt ?? existingPrompt.createdAt,
        updatedAt: new Date().toISOString()
      }
      
      prompts[index] = updatedPrompt
      saveSystemPrompts(prompts)
    }
  }

  const deleteSystemPrompt = (id: string): void => {
    const prompts = getSystemPrompts()
    const filtered = prompts.filter(p => p.id !== id)
    saveSystemPrompts(filtered)
  }

  const toggleSystemPrompt = (id: string): void => {
    const prompts = getSystemPrompts()
    const prompt = prompts.find(p => p.id === id)
    if (prompt) {
      prompt.active = !prompt.active
      prompt.updatedAt = new Date().toISOString()
      saveSystemPrompts(prompts)
    }
  }

  const reorderSystemPrompts = (prompts: SystemPrompt[]): void => {
    const updated = prompts.map((prompt, index) => ({
      ...prompt,
      order: index,
      updatedAt: new Date().toISOString()
    }))
    saveSystemPrompts(updated)
  }

  const getActiveSystemPrompts = (): SystemPrompt[] => {
    return getSystemPrompts()
      .filter(p => p.active)
      .sort((a, b) => a.order - b.order)
  }

  const exportSystemPrompts = (): string => {
    const prompts = getSystemPrompts()
    return JSON.stringify(prompts, null, 2)
  }

  const importSystemPrompts = (jsonData: string): boolean => {
    try {
      const imported = JSON.parse(jsonData) as SystemPrompt[]
      
      // Validate structure
      if (!Array.isArray(imported)) return false
      
      const isValid = imported.every(p => 
        p.id && p.name && p.content !== undefined && 
        typeof p.active === 'boolean' && typeof p.order === 'number'
      )
      
      if (!isValid) return false
      
      saveSystemPrompts(imported)
      return true
    } catch (error) {
      console.error('Error importing system prompts:', error)
      return false
    }
  }

  return {
    getSystemPrompts,
    addSystemPrompt,
    updateSystemPrompt,
    deleteSystemPrompt,
    toggleSystemPrompt,
    reorderSystemPrompts,
    getActiveSystemPrompts,
    exportSystemPrompts,
    importSystemPrompts
  }
}