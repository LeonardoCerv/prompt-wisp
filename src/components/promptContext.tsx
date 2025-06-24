'use client'

import { createContext, useContext } from 'react'
import { type User } from '@supabase/supabase-js'
import { PromptData } from './promptCard'
import { FilterType } from './use-prompts'

interface PromptContextType {
  prompts: PromptData[]
  filteredPrompts: PromptData[]
  searchTerm: string
  activeFilter: FilterType
  selectedTags: string[]
  selectedPrompt: PromptData | null
  allTags: string[]
  setSearchTerm: (term: string) => void
  setActiveFilter: (filter: FilterType) => void
  toggleTag: (tag: string) => void
  selectPrompt: (prompt: PromptData | null) => void
  toggleFavorite: (id: string) => void
  copyToClipboard: (content: string, title: string) => void
  deletePrompt: (id: string) => void
  restorePrompt: (id: string) => void
  savePrompt: (id: string) => void
  createNewPrompt: (newPrompt: {
    title: string
    description: string
    tags: string
    content: string
  }) => void
  updatePrompt: (id: string, updates: Partial<PromptData>) => void
  isOwner: (prompt: PromptData) => boolean
  getFilterCount: (filter: FilterType) => number
  user: User
}

const PromptContext = createContext<PromptContextType | undefined>(undefined)

export const usePromptContext = () => {
  const context = useContext(PromptContext)
  if (context === undefined) {
    throw new Error('usePromptContext must be used within a PromptProvider')
  }
  return context
}

export const PromptProvider = PromptContext.Provider
