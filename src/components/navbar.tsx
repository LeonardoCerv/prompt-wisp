'use client'

import { useState, useEffect, useCallback } from 'react'
import { type User } from '@supabase/supabase-js'
import PromptSidebar from '@/components/promptSidebar'
import PromptMidbar from '@/components/promptMidbar'
import NewCollection from '@/components/newCollection'
import { toast } from 'sonner';
import { PromptData } from '@/lib/models/prompt'
import { CollectionData } from '@/lib/models'

// Define FilterType
export type FilterType = 'all' | 'all-prompts' | 'your-prompts' | 'favorites' | 'saved' | 'deleted' | CollectionData

// Extended interface for transformed prompt data
interface ExtendedPromptData extends PromptData {
  isOwner: boolean
  isFavorite: boolean
  isSaved: boolean
  isDeleted?: boolean
}

interface NavbarProps {
  user: User
  children?: React.ReactNode
  initialPrompts?: ExtendedPromptData[]
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
      toast.success('Prompt moved to Recently Deleted')
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

export async function toggleFavorite(id: string) {
  try {
    const response = await fetch('/api/prompts/favorite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptId: id })
    })

    if (!response.ok) {
      toast.error('Failed to toggle favorite')
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    toast.error('Failed to toggle favorite')
  }
}

export async function createNewPrompt(newPrompt: {
  title: string
  description: string
  tags: string
  content: string
  visibility?: 'public' | 'private' | 'unlisted'
  images?: string[]
  collaborators?: string[]
  collections?: string[]
}, onSuccess?: (promptId: string) => void) {
  try {
    console.log('Creating prompt with data:', newPrompt);
    
    const requestBody = {
      title: newPrompt.title.trim(),
      description: newPrompt.description.trim() || null,
      content: newPrompt.content.trim(),
      tags: newPrompt.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      visibility: newPrompt.visibility || 'private',
      images: newPrompt.images || null,
      collaborators: newPrompt.collaborators || null,
      collections: newPrompt.collections || null
    };
    
    console.log('Request body:', requestBody);

    const response = await fetch('/api/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (response.ok) {
      const createdPrompt = await response.json()
      console.log('Created prompt:', createdPrompt);
      toast.success('Prompt created successfully')
      if (onSuccess) {
        onSuccess(createdPrompt.id)
      }
      return createdPrompt
    } else {
      const errorData = await response.json()
      console.error('Error response:', errorData);
      toast.error(errorData.error || 'Failed to create prompt')
      throw new Error(errorData.error || 'Failed to create prompt')
    }
  } catch (error) {
    console.error('Error creating prompt:', error)
    toast.error('Failed to create prompt')
    throw error
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

// Standalone utility functions for use by other components
export async function refreshPrompts() {
  try {
    const response = await fetch('/api/prompts/user')
    if (response.ok) {
      return await response.json()
    } else {
      console.error('Failed to load prompts')
      return []
    }
  } catch (error) {
    console.error('Error loading prompts:', error)
    return []
  }
}

export async function loadTags() {
  try {
    const response = await fetch('/api/prompts/tags')
    if (response.ok) {
      return await response.json()
    } else {
      return []
    }
  } catch (error) {
    console.error('Error loading tags:', error)
    return []
  }
}

// Utility functions for filtering and counting prompts
export function filterPrompts(
  prompts: ExtendedPromptData[], 
  filter: FilterType,
  searchTerm: string = '', 
  selectedTags: string[] = [],
  collection: CollectionData 
): ExtendedPromptData[] {
  let filtered = prompts

  // Apply filter
  switch (filter) {
    case 'all':
      filtered = []
      break
    case 'all-prompts':
      filtered = prompts.filter(p => !p.deleted)
      break
    case 'your-prompts':
      filtered = prompts.filter(p => p.isOwner && !p.deleted)
      break
    case 'favorites':
      filtered = prompts.filter(p => p.isFavorite && !p.deleted)
      break
    case 'saved':
      filtered = prompts.filter(p => p.isSaved && !p.deleted)
      break
    case 'deleted':
      filtered = prompts.filter(p => p.deleted && p.isOwner)
      break
  }

  // filter by collections
  if (collection) {
    filtered = filtered.filter(p => p.collections && p.collections.includes(collection.id))
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

  return filtered
}

export function getPromptFilterCount(prompts: ExtendedPromptData[], filter: FilterType): number {
  switch (filter) {
    case 'all':
      return 0
    case 'all-prompts':
      return prompts.filter(p => !p.deleted).length
    case 'your-prompts':
      return prompts.filter(p => p.isOwner && !p.deleted).length
    case 'favorites':
      return prompts.filter(p => p.isFavorite && !p.deleted).length
    case 'saved':
      return prompts.filter(p => p.isSaved && !p.deleted).length
    case 'deleted':
      return prompts.filter(p => p.deleted && p.isOwner).length
    default:
      return 0
  }
}

export function checkIsOwner(prompt: ExtendedPromptData, userId: string): boolean {
  return prompt.user_id === userId
}

// Custom hook for managing prompt state (can be used by other components)
export function usePromptState(initialPrompts: ExtendedPromptData[] = []) {
  const [prompts, setPrompts] = useState<ExtendedPromptData[]>(initialPrompts)
  const [filteredPrompts, setFilteredPrompts] = useState<ExtendedPromptData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<ExtendedPromptData | null>(null)
  const [allTags, setAllTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }, [])

  const selectPrompt = useCallback((prompt: ExtendedPromptData | null) => {
    setSelectedPrompt(prompt)
  }, [])

  return {
    prompts,
    setPrompts,
    filteredPrompts,
    setFilteredPrompts,
    searchTerm,
    setSearchTerm,
    activeFilter,
    setActiveFilter,
    selectedTags,
    setSelectedTags,
    selectedPrompt,
    setSelectedPrompt,
    allTags,
    setAllTags,
    loading,
    setLoading,
    toggleTag,
    selectPrompt
  }
}

export default function Navbar({ user, children, initialPrompts = [] }: NavbarProps) {

  const [collectionsExpanded, setCollectionsExpanded] = useState(false)
  const [tagsExpanded, setTagsExpanded] = useState(false)
  const [libraryExpanded, setLibraryExpanded] = useState(false)
  const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null)
  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false)

  // Add the missing state variables
  const [prompts, setPrompts] = useState<ExtendedPromptData[]>(initialPrompts)
  const [filteredPrompts, setFilteredPrompts] = useState<ExtendedPromptData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<ExtendedPromptData | null>(null)
  const [allTags, setAllTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [collections, setCollections] = useState<any[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string | undefined>(undefined)

  // Load prompts from API
  const refreshPromptsInternal = useCallback(async () => {
    setLoading(true)
    try {
      const userPrompts = await refreshPrompts()
      setPrompts(userPrompts)
    } catch (error) {
      console.error('Error loading prompts:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load tags from API
  const loadTagsInternal = useCallback(async () => {
    try {
      const tags = await loadTags()
      setAllTags(tags)
    } catch (error) {
      console.error('Error loading tags:', error)
    }
  }, [])

  // Load collections from API
  const loadCollections = useCallback(async () => {
    try {
      const response = await fetch('/api/collections')
      if (response.ok) {
        const data = await response.json()
        setCollections(data.collections || [])
      }
    } catch (error) {
      console.error('Error loading collections:', error)
    }
  }, [])

  // Initial load
  useEffect(() => {
    if (initialPrompts.length === 0) {
      refreshPromptsInternal()
    }
    loadTagsInternal()
    loadCollections()
  }, [refreshPromptsInternal, loadTagsInternal, loadCollections, initialPrompts.length])

  // Filter prompts based on active filter, search term, and selected tags
  useEffect(() => {
    const filtered = filterPrompts(prompts, activeFilter, searchTerm, selectedTags, selectedCollection ? collections.find(c => c.id === selectedCollection) : undefined)
    setFilteredPrompts(filtered)
  }, [prompts, activeFilter, searchTerm, selectedTags])

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }, [])


  const getFilterCount = useCallback((filter: FilterType) => {
    return getPromptFilterCount(prompts, filter)
  }, [prompts])

  const handleCreateCollection = useCallback(async (collectionData: {
    title: string
    description: string
    tags: string
    visibility: 'public' | 'private' | 'unlisted'
    images: string[]
    collaborators: { id: string; name: string; username: string; email: string; profile_picture?: string; display: string }[]
    prompts: { id: string; title: string; description?: string; content: string; tags: string[] }[]
  }) => {
    try {
      const requestBody = {
        title: collectionData.title.trim(),
        description: collectionData.description.trim() || null,
        tags: collectionData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        visibility: collectionData.visibility,
        images: collectionData.images.length > 0 ? collectionData.images : null,
        collaborators: collectionData.collaborators.length > 0 ? collectionData.collaborators.map(c => c.id) : null,
        prompts: collectionData.prompts.length > 0 ? collectionData.prompts.map(p => p.id) : [],
        user_id: user.id
      }

      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        const createdCollection = await response.json()
        toast.success('Collection created successfully')
        // Refresh collections list
        loadCollections()
        return createdCollection
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to create collection')
        throw new Error(errorData.error || 'Failed to create collection')
      }
    } catch (error) {
      console.error('Error creating collection:', error)
      toast.error('Failed to create collection')
      throw error
    }
  }, [user.id])

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
              onCreateCollection={() => setIsNewCollectionOpen(true)}
              collections={collections}
              selectedCollection={selectedCollection}
              onCollectionSelect={setSelectedCollection}
            />
          </div>

          {/* Center Column - Prompt List */}
          <div className={`h-full flex flex-col ${activeFilter === 'all' ? 'hidden' : 'w-[300px]'}`}> 
            <PromptMidbar
              prompts={filteredPrompts}
              user={{ id: user.id, email: user.email }}
            />
          </div>

          <div className="flex-1 h-full">
            {children}
          </div>
        </div>
      </div>

      {/* New Collection Dialog */}
      <NewCollection
        open={isNewCollectionOpen}
        onOpenChange={setIsNewCollectionOpen}
        onSubmit={handleCreateCollection}
        availablePrompts={prompts.filter(p => !p.deleted).map(p => ({
          id: p.id,
          title: p.title,
          description: p.description || undefined,
          content: p.content,
          tags: p.tags
        }))}
      />
    </div>
  )
}
