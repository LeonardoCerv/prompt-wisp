'use client'

import { useState, useEffect, useCallback } from 'react'
import PromptSidebar from '@/components/promptSidebar'
import PromptMidbar from '@/components/promptMidbar'
import NewCollection from '@/components/newCollection'
import { toast } from 'sonner';
import { PromptData } from '@/lib/models/prompt'
import { useNavbar } from '../context/navbarContext'

export default function Navbar({children }: { children: React.ReactNode}) {

  const { refreshPrompts, loadTags, getUser, getPrompts} = useNavbar()
  const user = getUser()
  const initialPromptsPromise = getPrompts()

  const [collectionsExpanded, setCollectionsExpanded] = useState(false)
  const [tagsExpanded, setTagsExpanded] = useState(false)
  const [libraryExpanded, setLibraryExpanded] = useState(false)
  const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null)
  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false)

  // Add the missing state variables
  const [prompts, setPrompts] = useState<PromptData[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<PromptData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null)
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
    let isMounted = true
    initialPromptsPromise.then((data: PromptData[]) => {
      if (isMounted) setPrompts(data)
    })
    loadTagsInternal()
    loadCollections()
    return () => { isMounted = false }
  }, [refreshPromptsInternal, loadTagsInternal, loadCollections, initialPromptsPromise])

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


  const getFilterCount = useCallback((filter: string) => {
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
