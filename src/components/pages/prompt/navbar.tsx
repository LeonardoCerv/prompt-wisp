'use client'

import { useState } from 'react'
import { type User } from '@supabase/supabase-js'
import PromptSidebar from '@/components/promptSidebar'
import PromptMidbar from '@/components/promptMidbar'
import { usePromptContext } from '@/components/promptContext'
import { toast } from 'sonner';

export interface PromptData {
  id: string
  slug: string
  title: string
  description: string
  tags: string[]
  isFavorite: boolean
  isDeleted: boolean
  isSaved: boolean
  isOwner: boolean
  isPublic: boolean
  createdAt: string
  lastUsed: string
  content: string
  user_id: string
}

interface NavbarProps {
  user: User
  children?: React.ReactNode
}

export async function savePrompt(id: string) {
  try {
    const response = await fetch('/api/prompts/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptId: id })
    })

    if (response.ok) {
      const { isSaved } = await response.json()
      toast.success(isSaved ? 'Prompt saved' : 'Prompt unsaved')
    } else {
      toast.error('Failed to save prompt')
    }
  } catch (error) {
    console.error('Error saving prompt:', error)
    toast.error('Failed to save prompt')
  }
}

export async function deletePrompt(id: string) {
  try {
    const response = await fetch(`/api/prompts?id=${id}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      toast.success('Prompt deleted')
    } else {
      toast.error('Failed to delete prompt')
    }
  } catch (error) {
    console.error('Error deleting prompt:', error)
    toast.error('Failed to delete prompt')
  }
}

export async function restorePrompt(id: string) {
  try {
    const response = await fetch('/api/prompts/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptId: id })
    })

    if (response.ok) {
      toast.success('Prompt restored')
    } else {
      toast.error('Failed to restore prompt')
    }
  } catch (error) {
    console.error('Error restoring prompt:', error)
    toast.error('Failed to restore prompt')
  }
}

export async function createNewPrompt(newPrompt: {
  title: string
  description: string
  tags: string
  content: string
}) {
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

      toast.success('Prompt created successfully')
    } else {
      toast.error('Failed to create prompt')
    }
  } catch (error) {
    console.error('Error creating prompt:', error)
    toast.error('Failed to create prompt')
  }
}

export function copyToClipboard(content: string, title: string) {
  navigator.clipboard.writeText(content).then(() => {
    toast.success(`"${title}" copied to clipboard`)
  }).catch(() => {
    toast.error('Failed to copy to clipboard')
  })
}

export function isMidbarExpanded(activeFilter: string): boolean {
  return activeFilter !== 'all'
}

export default function Navbar({ user, children }: NavbarProps) {
  const {
    prompts,
    filteredPrompts,
    searchTerm,
    setSearchTerm,
    activeFilter,
    setActiveFilter,
    selectedTags,
    toggleTag,
    allTags,
    selectedPrompt,
    selectPrompt,
    toggleFavorite,
    copyToClipboard,
    deletePrompt,
    restorePrompt,
    savePrompt,
    createNewPrompt,
    isOwner,
    getFilterCount
  } = usePromptContext()

  const [collectionsExpanded, setCollectionsExpanded] = useState(false)
  const [tagsExpanded, setTagsExpanded] = useState(false)
  const [libraryExpanded, setLibraryExpanded] = useState(false)
  const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null)

  return (
    <div className="min-h-screen bg-[var(--black)] w-full">
      <div className="h-screen">
        {/* Three Column Layout */}
        <div className="flex gap-0 h-full">

          {/* Left Column - Filters */}
          <div className="w-[240px] flex-shrink-0 h-full">
            <PromptSidebar
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              selectedTags={selectedTags}
              onTagToggle={toggleTag}
              allTags={allTags}
              getFilterCount={getFilterCount}
              onSearchFocus={() => searchInputRef?.focus()}
              collectionsExpanded={collectionsExpanded}
              setCollectionsExpanded={setCollectionsExpanded}
              tagsExpanded={tagsExpanded}
              setTagsExpanded={setTagsExpanded}
              libraryExpanded={libraryExpanded}
              setLibraryExpanded={setLibraryExpanded}
              onHomeClick={() => setActiveFilter('all')}
            />
          </div>

          {/* Center Column - Prompt List */}
          <div className={`h-full flex flex-col ${activeFilter === 'all' ? 'hidden' : 'w-[300px]'}`}> 
            <PromptMidbar
              user={user}
              prompts={prompts}
            />
          </div>

          <div className="flex-1 h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
