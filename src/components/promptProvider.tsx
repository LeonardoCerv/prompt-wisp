'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { type User } from '@supabase/supabase-js'
import { toast } from 'sonner'

// Import the types
export interface PromptData {
  id: string
  slug: string
  title: string
  description: string | null
  tags: string[]
  isFavorite: boolean
  isDeleted: boolean
  isSaved: boolean
  isOwner: boolean
  isPublic?: boolean
  createdAt: string
  lastUsed: string
  content: string
  user_id: string
  profile?: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  }
}

export type FilterType = 
  | 'all'
  | 'all-prompts'
  | 'your-prompts'
  | 'favorites'
  | 'saved'
  | 'deleted'

interface PromptContextType {
  prompts: PromptData[]
  filteredPrompts: PromptData[]
  searchTerm: string
  activeFilter: FilterType
  selectedTags: string[]
  selectedPrompt: PromptData | null
  allTags: string[]
  loading: boolean
  setSearchTerm: (term: string) => void
  setActiveFilter: (filter: FilterType) => void
  toggleTag: (tag: string) => void
  selectPrompt: (prompt: PromptData | null) => void
  toggleFavorite: (id: string) => Promise<void>
  copyToClipboard: (content: string, title: string) => void
  deletePrompt: (id: string) => Promise<void>
  restorePrompt: (id: string) => Promise<void>
  savePrompt: (id: string) => Promise<void>
  createNewPrompt: (newPrompt: {
    title: string
    description: string
    tags: string
    content: string
  }) => Promise<void>
  updatePrompt: (id: string, updates: Partial<PromptData>) => Promise<void>
  isOwner: (prompt: PromptData) => boolean
  getFilterCount: (filter: FilterType) => number
  user: User
  refreshPrompts: () => Promise<void>
}

const PromptContext = createContext<PromptContextType | undefined>(undefined)

export const usePromptContext = () => {
  const context = useContext(PromptContext)
  if (context === undefined) {
    throw new Error('usePromptContext must be used within a PromptProvider')
  }
  return context
}

interface PromptProviderProps {
  children: React.ReactNode
  user: User
  initialPrompts?: PromptData[]
}

export function PromptProvider({ children, user, initialPrompts = [] }: PromptProviderProps) {
  const [prompts, setPrompts] = useState<PromptData[]>(initialPrompts)
  const [filteredPrompts, setFilteredPrompts] = useState<PromptData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null)
  const [allTags, setAllTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Load prompts from API
  const refreshPrompts = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/prompts/user')
      if (response.ok) {
        const userPrompts = await response.json()
        setPrompts(userPrompts)
      } else {
        console.error('Failed to load prompts')
      }
    } catch (error) {
      console.error('Error loading prompts:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load tags from API
  const loadTags = useCallback(async () => {
    try {
      const response = await fetch('/api/prompts/tags')
      if (response.ok) {
        const tags = await response.json()
        setAllTags(tags)
      }
    } catch (error) {
      console.error('Error loading tags:', error)
    }
  }, [])

  // Initial load
  useEffect(() => {
    if (initialPrompts.length === 0) {
      refreshPrompts()
    }
    loadTags()
  }, [refreshPrompts, loadTags, initialPrompts.length])

  // Filter prompts based on active filter, search term, and selected tags
  useEffect(() => {
    let filtered = prompts

    // Apply filter
    switch (activeFilter) {
      case 'all':
        // Show home view - no prompts
        filtered = []
        break
      case 'all-prompts':
        filtered = prompts.filter(p => !p.isDeleted)
        break
      case 'your-prompts':
        filtered = prompts.filter(p => p.isOwner && !p.isDeleted)
        break
      case 'favorites':
        filtered = prompts.filter(p => p.isFavorite && !p.isDeleted)
        break
      case 'saved':
        filtered = prompts.filter(p => p.isSaved && !p.isDeleted)
        break
      case 'deleted':
        filtered = prompts.filter(p => p.isDeleted && p.isOwner)
        break
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(p =>
        selectedTags.every(tag => p.tags.includes(tag))
      )
    }

    setFilteredPrompts(filtered)
  }, [prompts, activeFilter, searchTerm, selectedTags])

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }, [])

  const selectPrompt = useCallback((prompt: PromptData | null) => {
    setSelectedPrompt(prompt)
  }, [])

  const toggleFavorite = useCallback(async (id: string) => {
    try {
      const response = await fetch('/api/prompts/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId: id })
      })

      if (response.ok) {
        const { isFavorite } = await response.json()
        setPrompts(prev => prev.map(p =>
          p.id === id ? { ...p, isFavorite } : p
        ))
        
        // Update selected prompt if it's the same one
        if (selectedPrompt?.id === id) {
          setSelectedPrompt(prev => prev ? { ...prev, isFavorite } : null)
        }
      } else {
        toast.error('Failed to toggle favorite')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to toggle favorite')
    }
  }, [selectedPrompt])

  const savePrompt = useCallback(async (id: string) => {
    try {
      const response = await fetch('/api/prompts/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId: id })
      })

      if (response.ok) {
        const { isSaved } = await response.json()
        setPrompts(prev => prev.map(p =>
          p.id === id ? { ...p, isSaved } : p
        ))
        
        // Update selected prompt if it's the same one
        if (selectedPrompt?.id === id) {
          setSelectedPrompt(prev => prev ? { ...prev, isSaved } : null)
        }
        
        toast.success(isSaved ? 'Prompt saved' : 'Prompt unsaved')
      } else {
        toast.error('Failed to save prompt')
      }
    } catch (error) {
      console.error('Error saving prompt:', error)
      toast.error('Failed to save prompt')
    }
  }, [selectedPrompt])

  const deletePrompt = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/prompts?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPrompts(prev => prev.map(p =>
          p.id === id ? { ...p, isDeleted: true } : p
        ))
        
        // Update selected prompt if it's the same one
        if (selectedPrompt?.id === id) {
          setSelectedPrompt(prev => prev ? { ...prev, isDeleted: true } : null)
        }
        
        toast.success('Prompt deleted')
      } else {
        toast.error('Failed to delete prompt')
      }
    } catch (error) {
      console.error('Error deleting prompt:', error)
      toast.error('Failed to delete prompt')
    }
  }, [selectedPrompt])

  const restorePrompt = useCallback(async (id: string) => {
    try {
      const response = await fetch('/api/prompts/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId: id })
      })

      if (response.ok) {
        setPrompts(prev => prev.map(p =>
          p.id === id ? { ...p, isDeleted: false } : p
        ))
        
        // Update selected prompt if it's the same one
        if (selectedPrompt?.id === id) {
          setSelectedPrompt(prev => prev ? { ...prev, isDeleted: false } : null)
        }
        
        toast.success('Prompt restored')
      } else {
        toast.error('Failed to restore prompt')
      }
    } catch (error) {
      console.error('Error restoring prompt:', error)
      toast.error('Failed to restore prompt')
    }
  }, [selectedPrompt])

  const createNewPrompt = useCallback(async (newPrompt: {
    title: string
    description: string
    tags: string
    content: string
  }) => {
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPrompt.title,
          description: newPrompt.description,
          content: newPrompt.content,
          tags: newPrompt.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          is_public: false
        })
      })

      if (response.ok) {
        const createdPrompt = await response.json()
        
        // Transform to our format
        const transformedPrompt: PromptData = {
          id: createdPrompt.id,
          slug: createdPrompt.slug,
          title: createdPrompt.title,
          description: createdPrompt.description,
          tags: createdPrompt.tags,
          isFavorite: false,
          isDeleted: false,
          isSaved: false,
          isOwner: true,
          isPublic: createdPrompt.is_public,
          createdAt: new Date(createdPrompt.created_at).toISOString().split('T')[0],
          lastUsed: new Date(createdPrompt.last_used_at || createdPrompt.created_at).toISOString().split('T')[0],
          content: createdPrompt.content,
          user_id: createdPrompt.user_id
        }
        
        setPrompts(prev => [transformedPrompt, ...prev])
        toast.success('Prompt created successfully')
      } else {
        toast.error('Failed to create prompt')
      }
    } catch (error) {
      console.error('Error creating prompt:', error)
      toast.error('Failed to create prompt')
    }
  }, [])

  const updatePrompt = useCallback(async (id: string, updates: Partial<PromptData>) => {
    try {
      const response = await fetch('/api/prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates })
      })

      if (response.ok) {
        await response.json() // Read response but don't use
        
        setPrompts(prev => prev.map(p =>
          p.id === id ? { ...p, ...updates } : p
        ))
        
        // Update selected prompt if it's the same one
        if (selectedPrompt?.id === id) {
          setSelectedPrompt(prev => prev ? { ...prev, ...updates } : null)
        }
        
        toast.success('Prompt updated successfully')
      } else {
        toast.error('Failed to update prompt')
      }
    } catch (error) {
      console.error('Error updating prompt:', error)
      toast.error('Failed to update prompt')
    }
  }, [selectedPrompt])

  const copyToClipboard = useCallback((content: string, title: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast.success(`"${title}" copied to clipboard`)
    }).catch(() => {
      toast.error('Failed to copy to clipboard')
    })
  }, [])

  const isOwner = useCallback((prompt: PromptData) => {
    return prompt.user_id === user.id
  }, [user.id])

  const getFilterCount = useCallback((filter: FilterType) => {
    switch (filter) {
      case 'all':
        return 0
      case 'all-prompts':
        return prompts.filter(p => !p.isDeleted).length
      case 'your-prompts':
        return prompts.filter(p => p.isOwner && !p.isDeleted).length
      case 'favorites':
        return prompts.filter(p => p.isFavorite && !p.isDeleted).length
      case 'saved':
        return prompts.filter(p => p.isSaved && !p.isDeleted).length
      case 'deleted':
        return prompts.filter(p => p.isDeleted && p.isOwner).length
      default:
        return 0
    }
  }, [prompts])

  const value: PromptContextType = {
    prompts,
    filteredPrompts,
    searchTerm,
    activeFilter,
    selectedTags,
    selectedPrompt,
    allTags,
    loading,
    setSearchTerm,
    setActiveFilter,
    toggleTag,
    selectPrompt,
    toggleFavorite,
    copyToClipboard,
    deletePrompt,
    restorePrompt,
    savePrompt,
    createNewPrompt,
    updatePrompt,
    isOwner,
    getFilterCount,
    user,
    refreshPrompts
  }

  return (
    <PromptContext.Provider value={value}>
      {children}
    </PromptContext.Provider>
  )
}
