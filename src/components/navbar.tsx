"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import NewCollection from "@/components/newCollection"
import { toast } from "sonner"
import type { PromptData } from "@/lib/models/prompt"
import type { CollectionData, UserData } from "@/lib/models"
import { Button } from "./ui/button"
import {
  Archive,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Copy,
  Edit,
  Home,
  Plus,
  PlusCircle,
  RotateCcw,
  Search,
  Star,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Dialog from "./ui/dialog"
import { Card, CardContent } from "./ui/card"
import PromptCard from "./promptCard"
import NewPromptPage from "./newPrompt"

interface NavbarProps {
  children?: React.ReactNode
}

export async function savePrompt(id: string) {
  try {
    const response = await fetch("/api/prompts/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promptId: id }),
    })

    if (response.ok) {
      const { isSaved } = await response.json()
      toast.success(isSaved ? "Prompt saved" : "Prompt unsaved")
    } else {
      toast.error("Failed to save prompt")
    }
  } catch (error) {
    console.error("Error saving prompt:", error)
    toast.error("Failed to save prompt")
  }
}

export async function deletePrompt(id: string) {
  try {
    const response = await fetch(`/api/prompts?id=${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      toast.success("Prompt moved to Recently Deleted")
    } else {
      toast.error("Failed to delete prompt")
    }
  } catch (error) {
    console.error("Error deleting prompt:", error)
    toast.error("Failed to delete prompt")
  }
}

export async function restorePrompt(id: string) {
  try {
    const response = await fetch("/api/prompts/restore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promptId: id }),
    })

    if (response.ok) {
      toast.success("Prompt restored")
    } else {
      toast.error("Failed to restore prompt")
    }
  } catch (error) {
    console.error("Error restoring prompt:", error)
    toast.error("Failed to restore prompt")
  }
}

export async function toggleFavorite(id: string) {
  try {
    const response = await fetch("/api/prompts/favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promptId: id }),
    })

    if (!response.ok) {
      toast.error("Failed to toggle favorite")
    }
  } catch (error) {
    console.error("Error toggling favorite:", error)
    toast.error("Failed to toggle favorite")
  }
}

export async function createNewPrompt(
  newPrompt: {
    title: string
    description: string
    tags: string
    content: string
    visibility?: "public" | "private" | "unlisted"
    images?: string[]
    collaborators?: string[]
    collections?: string[]
  },
  onSuccess?: (promptId: string) => void,
) {
  try {
    console.log("Creating prompt with data:", newPrompt)

    const requestBody = {
      title: newPrompt.title.trim(),
      description: newPrompt.description.trim() || null,
      content: newPrompt.content.trim(),
      tags: newPrompt.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      visibility: newPrompt.visibility || "private",
      images: newPrompt.images || null,
      collaborators: newPrompt.collaborators || null,
      collections: newPrompt.collections || null,
    }

    console.log("Request body:", requestBody)

    const response = await fetch("/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    })

    console.log("Response status:", response.status)
    console.log("Response ok:", response.ok)

    if (response.ok) {
      const createdPrompt = await response.json()
      console.log("Created prompt:", createdPrompt)
      toast.success("Prompt created successfully")
      if (onSuccess) {
        onSuccess(createdPrompt.id)
      }
      return createdPrompt
    } else {
      const errorData = await response.json()
      console.error("Error response:", errorData)
      toast.error(errorData.error || "Failed to create prompt")
      throw new Error(errorData.error || "Failed to create prompt")
    }
  } catch (error) {
    console.error("Error creating prompt:", error)
    toast.error("Failed to create prompt")
    throw error
  }
}

export function copyToClipboard(content: string, title: string) {
  navigator.clipboard
    .writeText(content)
    .then(() => {
      toast.success(`"${title}" copied to clipboard`)
    })
    .catch(() => {
      toast.error("Failed to copy to clipboard")
    })
}

// Standalone utility functions for use by other components
export async function refreshPrompts() {
  try {
    const response = await fetch("/api/prompts/user")
    if (response.ok) {
      return await response.json()
    } else {
      console.error("Failed to load prompts")
      return []
    }
  } catch (error) {
    console.error("Error loading prompts:", error)
    return []
  }
}

export async function loadTags() {
  try {
    const response = await fetch("/api/prompts/tags")
    if (response.ok) {
      return await response.json()
    } else {
      return []
    }
  } catch (error) {
    console.error("Error loading tags:", error)
    return []
  }
}

export default function Navbar({ children }: NavbarProps) {
  const [collectionsExpanded, setCollectionsExpanded] = useState(false)
  const [tagsExpanded, setTagsExpanded] = useState(false)
  const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null)
  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false)

  // Add the missing state variables
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string>("home")
  const [selectedCollection, setSelectedCollection] = useState<string | undefined>(undefined)

  const [collections, setCollections] = useState<CollectionData[]>([])
  const [prompts, setPrompts] = useState<PromptData[]>([])
  const [user, setUser] = useState<UserData>()
  const [filteredPrompts, setFilteredPrompts] = useState<PromptData[]>([])

  const router = useRouter()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null)

  const handlePromptSelect = (prompt: PromptData) => {
    setSelectedPrompt(prompt)
    router.push(`/prompt/${prompt.id}`) // Navigate to the edit page
  }

  const isOwner = (prompt: PromptData) => {
    return prompt.user_id === user?.id
  }

  const isFavorite = (prompt: PromptData) => {
    return false
  }

  const handleSelectionChange = (filter: string) => {
    setSelectedFilter(filter)
    let filtered: PromptData[] = []

    if (filter === "home") {
      filtered = []
    } else if (filter === "favorites") {
      filtered = handleFavoritePrompts()
    } else if (filter === "deleted") {
      filtered = handleDeletedPrompts()
    } else if (filter === "all") {
      filtered = handleAllPrompts()
    } else if (filter === "your") {
      filtered = handleYourPrompts()
    } else if (filter === "saved") {
      filtered = handleSavedPrompts()
    } else if (filter === "collection") {
      filtered = handleCollectionPrompts()
    } else if (filter === "tags") {
      filtered = handleTagsPrompts()
    }

    setFilteredPrompts(filtered)
  }

  const handleFavoritePrompts = (): PromptData[] => {
    if (!user?.favorites || user.favorites.length === 0) return []
    return prompts.filter((prompt) => user.favorites?.includes(prompt.id))
  }

  const handleDeletedPrompts = (): PromptData[] => {
    return prompts.filter((prompt) => prompt.deleted)
  }

  const handleAllPrompts = (): PromptData[] => {
    return prompts.filter((prompt) => !prompt.deleted)
  }

  const handleYourPrompts = (): PromptData[] => {
    if (!user) return []
    return prompts.filter((prompt) => prompt.user_id === user.id && !prompt.deleted)
  }

  const handleSavedPrompts = (): PromptData[] => {
    if (!user?.bought || user.bought.length === 0) return []
    return prompts.filter(
      (prompt) => user.bought?.includes(prompt.id) && prompt.user_id !== user?.id && !prompt.deleted,
    )
  }

  const handleCollectionPrompts = (): PromptData[] => {
    if (!selectedCollection) return []
    return prompts.filter((prompt) => prompt.collections?.includes(selectedCollection) && !prompt.deleted)
  }

  const handleTagsPrompts = (): PromptData[] => {
    if (selectedTags.length === 0) return []
    return prompts.filter((prompt) => prompt.tags.some((tag) => selectedTags.includes(tag)) && !prompt.deleted)
  }

  // Load tags from API
  const loadTagsInternal = useCallback(async () => {
    try {
      const tags = await loadTags()
      setAllTags(tags)
    } catch (error) {
      console.error("Error loading tags:", error)
    }
  }, [])

  // Load collections from API
  const loadCollections = useCallback(async () => {
    try {
      const response = await fetch("/api/collections")
      if (response.ok) {
        const data = await response.json()
        setCollections(data.collections || [])
        console.log("Collections loaded:", data.collections || [])
      }
    } catch (error) {
      console.error("Error loading collections:", error)
    }
  }, [])

  // Load prompts from API
  const loadPrompts = useCallback(async () => {
    try {
      const response = await fetch("/api/prompts/user")
      if (response.ok) {
        const data = await response.json()
        setPrompts(data.prompts || data || []) // Fix
        console.log("Prompts loaded:", data.prompts || data)
      }
    } catch (error) {
      console.error("Error loading prompts:", error)
    }
  }, [])

  const loadUser = useCallback(async () => {
    try {
      const response = await fetch("/api/user")
      if (response.ok) {
        const data = await response.json()
        setUser(data)
        console.log("User data loaded:", data)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      setUser(undefined)
    }
  }, [])

  // Load initial data
  useEffect(() => {
    loadTagsInternal()
    loadCollections()
    loadPrompts()
    loadUser()
  }, [loadTagsInternal, loadCollections, loadPrompts, loadUser])

  const handleCreateCollection = useCallback(
    async (collectionData: {
      title: string
      description: string
      tags: string
      visibility: "public" | "private" | "unlisted"
      images: string[]
      collaborators: {
        id: string
        name: string
        username: string
        email: string
        profile_picture?: string
        display: string
      }[]
      prompts: { id: string; title: string; description?: string; content: string; tags: string[] }[]
    }) => {
      try {
        const requestBody = {
          title: collectionData.title.trim(),
          description: collectionData.description.trim() || null,
          tags: collectionData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          visibility: collectionData.visibility,
          images: collectionData.images.length > 0 ? collectionData.images : null,
          collaborators: collectionData.collaborators.length > 0 ? collectionData.collaborators.map((c) => c.id) : null,
          prompts: collectionData.prompts.length > 0 ? collectionData.prompts.map((p) => p.id) : [],
          user_id: user?.id,
        }

        const response = await fetch("/api/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        })

        if (response.ok) {
          const createdCollection = await response.json()
          toast.success("Collection created successfully")
          // Refresh collections list
          loadCollections()
          return createdCollection
        } else {
          const errorData = await response.json()
          toast.error(errorData.error || "Failed to create collection")
          throw new Error(errorData.error || "Failed to create collection")
        }
      } catch (error) {
        console.error("Error creating collection:", error)
        toast.error("Failed to create collection")
        throw error
      }
    },
    [user?.id],
  )

  useEffect(() => {
    if (selectedFilter !== "home") {
      handleSelectionChange(selectedFilter)
    }
  }, [prompts, user, selectedTags, selectedCollection])

  return (
    <div className="min-h-screen bg-[var(--black)] w-full">
      <div className="h-screen">
        {/* Three Column Layout */}
        <div className="flex gap-0 h-full">
          {/* Left Column - Filters */}
          <div className="w-[240px] max-w-[240px] flex-shrink-0">
            <div className="w-[240px] max-w-[240px] flex-shrink-0 h-screen bg-[var(--black)] px-2 py-6 border-r border-[var(--moonlight-silver-dim)]/30 flex flex-col fixed top-0 left-0 z-50">
              {/* Header - Fixed at top */}
              <div className="flex-shrink-0 gap-y-3 flex flex-col items-center mb-6">
                {/* Wisp Logo
                <Link href="/" className="flex items-center gap-3 justify-center p-2 mb-6">
                  <Image 
                    src="/wisplogo.svg"
                    alt="Wisp logo"
                    width={100}
                    height={100}
                    priority
                    className="object-contain"
                  />
                </Link>
                */}

                {/* Search */}
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-[var(--moonlight-silver-bright)] rounded-lg py-2 px-3"
                  onClick={() => searchInputRef?.focus()}
                  title="Search"
                >
                  <Search size={16} className="flex-shrink-0" />
                  <span className="truncate">Search</span>
                </Button>

                {/* Home */}
                <Link href="/prompt" className="w-full justify-start p-0 m-0">
                  <Button
                    variant={selectedFilter === "home" ? "default" : "ghost"}
                    className={`w-full justify-start p-0 gap-3 rounded-lg py-2 px-3 ${
                      selectedFilter === "home"
                        ? "bg-[var(--wisp-blue)] text-white shadow-sm"
                        : "text-[var(--moonlight-silver-bright)]"
                    }`}
                    title="Home"
                    onClick={() => {
                      handleSelectionChange("home")
                    }}
                  >
                    <Home size={16} className="flex-shrink-0" />
                    <span className="truncate">Home</span>
                  </Button>
                </Link>

                {/* Favorites */}
                <Button
                  variant={selectedFilter === "favorites" ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 rounded-lg py-2 px-3 ${
                    selectedFilter === "favorites"
                      ? "bg-[var(--wisp-blue)] text-white shadow-sm"
                      : "text-[var(--moonlight-silver-bright)]"
                  }`}
                  onClick={() => {
                    handleSelectionChange("favorites")
                  }}
                  title="Favorites"
                >
                  <Star size={16} className="flex-shrink-0" />
                  <span className="truncate">Favorites</span>
                </Button>

                {/* All prompts */}
                <Button
                  variant={selectedFilter === "all" ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 rounded-lg py-2 px-3 ${
                    selectedFilter === "all"
                      ? "bg-[var(--wisp-blue)] text-white shadow-sm"
                      : "text-[var(--moonlight-silver-bright)]"
                  }`}
                  onClick={() => {
                    handleSelectionChange("all")
                  }}
                  title="All Prompts"
                >
                  <BookOpen size={16} className="flex-shrink-0" />
                  <span className="truncate">All Prompts</span>
                </Button>

                {/* Your prompts */}
                <Button
                  variant={selectedFilter === "your" ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 rounded-lg py-2 px-3 ${
                    selectedFilter === "your"
                      ? "bg-[var(--wisp-blue)] text-white shadow-sm"
                      : "text-[var(--moonlight-silver-bright)]"
                  }`}
                  onClick={() => {
                    handleSelectionChange("your")
                  }}
                  title="Your Prompts"
                >
                  <Edit size={16} className="flex-shrink-0" />
                  <span className="truncate">Your Prompts</span>
                </Button>

                {/* Saved prompts */}
                <Button
                  variant={selectedFilter === "saved" ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 rounded-lg py-2 px-3 ${
                    selectedFilter === "saved"
                      ? "bg-[var(--flare-cyan)] text-white shadow-sm"
                      : "text-[var(--moonlight-silver-bright)]"
                  }`}
                  onClick={() => {
                    handleSelectionChange("saved")
                  }}
                  title="Saved"
                >
                  <Archive size={16} className="flex-shrink-0" />
                  <span className="truncate">Saved</span>
                </Button>
              </div>

              {/* Scrollable middle section */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {/* Collections Section */}
                <div className="space-y-2 px-2">
                  <h3
                    className="text-[10px] font-medium text-[var(--wisp-blue)] uppercase tracking-wider cursor-pointer transition-colors flex justify-between gap-2"
                    onClick={() => setCollectionsExpanded(!collectionsExpanded)}
                  >
                    Collections
                    {collectionsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </h3>

                  {collectionsExpanded && (
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsNewCollectionOpen(true)
                        }}
                        className="w-full justify-start gap-3 text-sm text-[var(--wisp-blue)] rounded-lg py-2 px-3 hover:bg-[var(--wisp-blue)]/20 hover:text-[var(--wisp-blue)] border border-dashed border-[var(--wisp-blue)]/40"
                        title="Create new collection"
                      >
                        <Plus size={14} className="flex-shrink-0" />
                        <span className="truncate">Create Collection</span>
                      </Button>
                      {collections.length > 0 ? (
                        collections.map((collection) => (
                          <Button
                            key={collection.id}
                            variant="ghost"
                            className={`w-full justify-start text-sm rounded-lg py-1.5 px-3 ${
                              selectedCollection === collection.id
                                ? "bg-[var(--wisp-blue)]/20 text-[var(--wisp-blue)]"
                                : "text-[var(--moonlight-silver)] hover:text-white hover:bg-white/5"
                            }`}
                            onClick={() => {
                              setSelectedCollection(collection.id)
                              setSelectedFilter("collection")
                              handleSelectionChange("collection")
                            }}
                            title={collection.title}
                          >
                            <span className="truncate">{collection.title}</span>
                          </Button>
                        ))
                      ) : (
                        <div className="text-xs text-[var(--moonlight-silver)]/60 px-3 py-2">
                          No collections yet. Click + to create one!
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Tags Section */}
                <div className="space-y-2 px-2">
                  <h3
                    className="text-[10px] font-medium text-[var(--flare-cyan)] uppercase tracking-wider mb-3 cursor-pointer hover:text-[var(--flare-cyan)]/70 transition-colors flex items-center justify-between"
                    onClick={() => setTagsExpanded(!tagsExpanded)}
                  >
                    Tags
                    {tagsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </h3>

                  {tagsExpanded && (
                    <div className="space-y-1">
                      {allTags.map((tag) => (
                        <Button
                          key={tag}
                          variant="ghost"
                          className={`w-full justify-start text-sm rounded-lg py-1.5 px-3 ${
                            selectedTags.includes(tag)
                              ? "bg-[var(--flare-cyan)]/20 text-[var(--flare-cyan)]"
                              : "text-[var(--moonlight-silver)]"
                          }`}
                          onClick={() => {
                            const newSelectedTags = selectedTags.includes(tag)
                              ? selectedTags.filter((t) => t !== tag)
                              : [...selectedTags, tag]
                            setSelectedTags(newSelectedTags)
                            setSelectedFilter("tags")
                            handleSelectionChange("tags")
                          }}
                          title={`#${tag}`}
                        >
                          <span className="truncate">#{tag}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recently Deleted - Fixed at bottom */}
              <div className="flex-shrink-0 mt-6">
                <Button
                  variant="destructive"
                  className={`w-full justify-start gap-3 rounded-lg py-2 px-3  ${
                    selectedFilter === "deleted"
                      ? "text-white shadow-sm bg-destructive/90 "
                      : "text-destructive hover:bg-destructive/50 hover:text-white"
                  }`}
                  onClick={() => {
                    handleSelectionChange("deleted")
                  }}
                  title="Recently Deleted"
                >
                  <Trash2 size={16} className="flex-shrink-0" />
                  <span className="truncate">Recently Deleted</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Center Column - Prompt List */}
          <div className={`h-full flex-col w-[300px] ${selectedFilter === "home" ? "hidden" : "flex"}`}>
              <div className="flex flex-col bg-[var(--blackblack)] p-0 h-screen">
                {/* Fixed Action Buttons - Always visible */}
                <div className="sticky top-0 z-10">
                  <div className="flex justify-end items-center gap-2 bg-[var(--blackblack)] p-2">
                    <Button
                      size="sm"
                      variant="icon"
                      onClick={() => setShowCreateDialog(true)}
                      className="h-10 w-10 p-0 hover:text-[var(--glow-ember)] text-[var(--glow-ember)]/70"
                      title="Create new prompt"
                    >
                      <PlusCircle size={22} />
                    </Button>

                    <Button
                      size="sm"
                      variant="icon"
                      onClick={() => selectedPrompt && copyToClipboard(selectedPrompt.content, selectedPrompt.title)}
                      disabled={!selectedPrompt}
                      className="h-10 w-10 p-0 hover:text-[var(--glow-ember)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--glow-ember)]/70"
                      title="Copy prompt"
                    >
                      <Copy size={22} />
                    </Button>

                    {selectedPrompt?.deleted ? (
                      <Button
                        size="sm"
                        variant="icon"
                        onClick={() => selectedPrompt && restorePrompt(selectedPrompt.id)}
                        disabled={!selectedPrompt || !selectedPrompt.deleted || !isOwner?.(selectedPrompt)}
                        className="h-10 w-10 hover:text-green-400 disabled:opacity-30 disabled:cursor-not-allowed text-green-400/70"
                        title="Restore prompt"
                      >
                        <RotateCcw size={22} />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="icon"
                        onClick={() => {
                          if (selectedPrompt) {
                            // If it's a saved prompt that user doesn't own, use unsave logic
                            if (!isOwner?.(selectedPrompt)) {
                              savePrompt(selectedPrompt.id)
                            } else {
                              // Otherwise use delete logic
                              deletePrompt(selectedPrompt.id)
                            }
                          }
                        }}
                        disabled={!selectedPrompt || selectedPrompt.deleted || !isOwner?.(selectedPrompt)}
                        className="h-10 w-10 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed text-red-400/70"
                        title={selectedPrompt && !isOwner?.(selectedPrompt) ? "Unsave prompt" : "Delete prompt"}
                      >
                        <Trash2 size={22} />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Filtered Results or Empty State - Show for non-'all' filters */}
                <div className="flex-1 overflow-y-auto px-3">
                  {prompts.length === 0 ? (
                    <Card className="bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)] text-center py-8">
                      <CardContent>
                        <BookOpen className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                        <h3 className="text-sm font-semibold text-slate-300 mb-2">No prompts found</h3>
                        <Button
                          onClick={() => setShowCreateDialog(true)}
                          size="sm"
                          className="bg-[var(--glow-ember)] hover:bg-[var(--glow-ember)]/90"
                        >
                          <PlusCircle size={14} className="mr-2" />
                          Create New Prompt
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    (selectedFilter === "home" ? prompts : filteredPrompts).map((prompt, index) => {
                      const isSelected = selectedPrompt?.id === prompt.id
                      const isLast = index === (selectedFilter === "home" ? prompts : filteredPrompts).length - 1
                      const isBeforeSelected =
                        index < (selectedFilter === "home" ? prompts : filteredPrompts).length - 1 &&
                        (selectedFilter === "home" ? prompts : filteredPrompts)[index + 1]?.id === selectedPrompt?.id

                      return (
                        <div key={prompt.id}>
                          <PromptCard
                            prompt={prompt}
                            isSelected={isSelected}
                            isLast={isLast}
                            isBeforeSelected={isBeforeSelected}
                            onSelect={() => handlePromptSelect(prompt)}
                            isOwner={isOwner(prompt)}
                            isFavorite={isFavorite(prompt)}
                          />
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
          </div>

          <div className="flex-1 h-full">{children}</div>
        </div>
      </div>

      {/* New Collection Dialog */}
      <NewCollection
        open={isNewCollectionOpen}
        onOpenChange={setIsNewCollectionOpen}
        onSubmit={handleCreateCollection}
        availablePrompts={prompts
          .filter((p) => !p.deleted)
          .map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description || undefined,
            content: p.content,
            tags: p.tags,
          }))}
      />

      {/* Create Prompt Dialog */}
      <Dialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} title="" maxWidth="max-w-3xl">
        <NewPromptPage
          onSubmit={async (prompt) => {
            try {
              // Transform the data to match the API format
              const transformedPrompt = {
                title: prompt.title,
                description: prompt.description,
                tags: prompt.tags,
                content: prompt.content,
                visibility: prompt.visibility,
                images: prompt.images,
                collaborators: prompt.collaborators.map((user) => user.id),
                collections: prompt.collections.map((collection) => collection),
              }

              await createNewPrompt(transformedPrompt, (promptId) => {
                router.push(`/prompt/${promptId}`)
              })
              setShowCreateDialog(false)
            } catch (error) {
              console.error("Error creating prompt:", error)
            }
          }}
          onCancel={() => setShowCreateDialog(false)}
        />
      </Dialog>
    </div>
  )
}
