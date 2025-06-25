'use client'

import { useState, useEffect, useCallback } from 'react'
import PromptSidebar from '@/components/promptSidebar'
import PromptMidbar from '@/components/promptMidbar'
import { toast } from 'sonner';
import { PromptData } from '@/lib/models/prompt'
import { UserData } from '@/lib/models'
import { createClient } from '@/lib/utils/supabase/client'

// Utility: filterPrompts
function filterPrompts(
  prompts: PromptData[],
  activeFilter: string,
  searchTerm: string,
  selectedTags: string[],
  selectedCollection: any,
  user: UserData
): PromptData[] {
  let filtered = prompts
  if (activeFilter === 'your-prompts') {
    filtered = filtered.filter(p => p.user_id === user.id && !p.deleted)
  } else if (activeFilter === 'saved') {
    filtered = filtered.filter(p => user.favorites?.includes(p.id))
  } else if (activeFilter === 'deleted') {
    filtered = filtered.filter(p => p.deleted)
  }
  if (selectedCollection) {
    filtered = filtered.filter(p => p.collections?.includes(selectedCollection.id))
  }
  if (selectedTags.length > 0) {
    filtered = filtered.filter(p => selectedTags.every(tag => p.tags?.includes(tag)))
  }
  if (searchTerm) {
    filtered = filtered.filter(p =>
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }
  return filtered
}

// Utility: getPromptFilterCount
function getPromptFilterCount(prompts: PromptData[], filter: string, user: UserData): number {
  if (filter === 'all') return prompts.length
  if (filter === 'your-prompts') return prompts.filter(p => p.user_id === user.id && !p.deleted).length
  if (filter === 'saved') return prompts.filter(p => user.favorites?.includes(p.id)).length
  if (filter === 'deleted') return prompts.filter(p => p.deleted).length
  return prompts.length
}

export default function Navbar({children}: { children: React.ReactNode}) { 
  // Fetch user profile and prompts from the API
  const [user, setUser] = useState<UserData | null>(null)
  const [prompts, setPrompts] = useState<PromptData[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        // Get user from supabase auth client
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          setUser(null)
          return
        }
        // Optionally fetch user profile from your API if needed
        const userRes = await fetch(`/api/users/`, { method: 'GET', cache: 'no-store' })
        const userData = await userRes.json()
        setUser(userData.user || userData)

        const promptsRes = await fetch(`/api/prompts/user/`, { method: 'GET', cache: 'no-store' })
        const promptsData = await promptsRes.json()
        const loadedPrompts = Array.isArray(promptsData.prompts)
          ? promptsData.prompts
          : Array.isArray(promptsData)
            ? promptsData
            : []
        setPrompts(loadedPrompts)
      } catch (error) {
        console.error('Error fetching user or prompts:', error)
      }
    }
    fetchData()
  }, [])

  const [collectionsExpanded, setCollectionsExpanded] = useState(false)
  const [tagsExpanded, setTagsExpanded] = useState(false)
  const [libraryExpanded, setLibraryExpanded] = useState(false)
  const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null)
  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false)

  // Add the missing state variables
  const [localPrompts, setLocalPrompts] = useState<PromptData[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<PromptData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null)
  const [allTags, setAllTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [collections, setCollections] = useState<any[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string | undefined>(undefined)

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
    let isMounted = true
    // Use the prompts state for initial load, but only if user is loaded
    if (user) setLocalPrompts(prompts)
    loadCollections()
    return () => { isMounted = false }
  }, [prompts, user, loadCollections])

  // Filter prompts based on active filter, search term, selected tags, and selected collection
  useEffect(() => {
    if (!user) return
    const filtered = filterPrompts(
      localPrompts,
      activeFilter,
      searchTerm,
      selectedTags,
      selectedCollection ? collections.find(c => c.id === selectedCollection) : undefined,
      user
    )
    setFilteredPrompts(filtered)
  }, [localPrompts, activeFilter, searchTerm, selectedTags, selectedCollection, collections, user])

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }, [])


  const getFilterCount = useCallback((filter: string) => {
    if (!user) return 0
    return getPromptFilterCount(localPrompts, filter, user)
  }, [localPrompts, user])

  const handleCreateCollection = useCallback(async (collectionData: {
    title: string
    description: string
    tags: string
    visibility: 'public' | 'private' | 'unlisted'
    images: string[]
    collaborators: { id: string; name: string; username: string; email: string; profile_picture?: string; display: string }[]
    prompts: { id: string; title: string; description?: string; content: string; tags: string[] }[]
  }) => {
    if (!user) {
      toast.error('User not loaded. Please wait and try again.')
      return
    }
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
  }, [user?.id])

  // Only one of library or collection can be selected at a time
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
    setSelectedCollection(undefined)
  }

  const handleCollectionSelect = (collectionId: string | undefined) => {
    setSelectedCollection(collectionId)
    setActiveFilter('') // Deselect library filter
  }

  return (
    <div className="min-h-screen bg-[var(--black)] w-full">
      {/* Only render children if user is loaded */}
      {user && (
        <div className="h-screen">
          {/* Three Column Layout */}
          <div className="flex gap-0 h-full">
            {/* Left Column - Filters */}
            <div className="w-[240px] flex-shrink-0 h-full">
              <PromptSidebar
                prompts={localPrompts}
                user={user}
                activeFilter={activeFilter}
                onFilterChange={handleFilterChange}
                selectedTags={selectedTags}
                onTagToggle={toggleTag}
                allTags={allTags}
                getFilterCount={getFilterCount}
              />
            </div>

            {/* Center Column - Prompt List */}
            <div className={`h-full flex flex-col ${activeFilter === 'all' ? 'hidden' : 'w-[300px]'}`}> 
              <PromptMidbar
                prompts={filteredPrompts}
                user={user}
              />
            </div>

            <div className="flex-1 h-full">
              {children}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
