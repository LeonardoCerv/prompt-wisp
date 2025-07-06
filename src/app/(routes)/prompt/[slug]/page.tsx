"use client"
import { notFound, useParams } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import PromptEdit from "@/components/prompt-edit"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, FileX, Lock, Eye, Save, Trash2, FolderOpen } from "lucide-react"
import Link from "next/link"
import { useApp } from "@/contexts/appContext"
import Prompt from "@/lib/models/prompt"
import Collection from "@/lib/models/collection"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { UsersPrompts } from "@/lib/models"
import UsersCollections from "@/lib/models/usersCollections"
import { user_role } from "@/lib/models/usersPrompts"
import { CollectionData } from "@/lib/models/collection"
import { PromptData } from "@/lib/models/prompt"
import { Badge } from "@/components/ui/badge"

// Collection View Component
function CollectionView({ selectedCollection, role }: { selectedCollection: CollectionData; role: user_role | null }) {
  const { actions, utils } = useApp()
  const [collectionPrompts, setCollectionPrompts] = useState<PromptData[]>([])
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false)

  // Memoize collection prompts to prevent unnecessary re-renders
  const memoizedCollectionPrompts = useMemo(() => collectionPrompts, [collectionPrompts])

  useEffect(() => {
    async function loadCollectionPrompts() {
      if (!selectedCollection) return
      
      setIsLoadingPrompts(true)
      try {
        // Use getSharedCollectionPrompts for better performance when viewing others' collections
        const prompts = role === "owner" 
          ? await utils.getCollectionPrompts(selectedCollection.id)
          : await utils.getSharedCollectionPrompts(selectedCollection.id)
        setCollectionPrompts(prompts)
      } catch (error) {
        console.error("Error loading collection prompts:", error)
        setCollectionPrompts([])
      } finally {
        setIsLoadingPrompts(false)
      }
    }
    
    loadCollectionPrompts()
}, [selectedCollection, selectedCollection?.id, utils, role])

  return (
    <div className="flex flex-col bg-[var(--prompts)] h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[var(--moonlight-silver-dim)]/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-[var(--moonlight-silver)]" />
            <h1 className="text-xl font-semibold text-[var(--moonlight-silver-bright)]">View Collection</h1>
          </div>
          <div className="flex items-center gap-1 text-sm text-[var(--moonlight-silver)]/60">
            <Lock size={14} />
            Read-only
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Button */}
          {!role && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  await actions.saveCollection(selectedCollection.id)
                  toast.success("Collection saved to your library")
                } catch {
                  toast.error("Failed to save collection")
                }
                // Only reload relationships, not all data
                actions.loadUserRelationships()
              }}
              className="text-[var(--moonlight-silver)] hover:text-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/10"
            >
              <Save size={16} />
            </Button>
          )}
          {role && role !== "owner" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  await actions.removeFromCollection(selectedCollection.id)
                  toast.success("Collection removed from your library")
                } catch {
                  toast.error("Failed to remove collection")
                }
                // Only reload relationships, not all data
                actions.loadUserRelationships()
              }}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 size={16} />
            </Button>
          )}
          {/* Back to Home */}
          <Link href="/prompt">
            <Button
              variant="ghost"
              size="sm"
              className="text-[var(--moonlight-silver)] hover:text-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/10"
            >
              <Home size={16} />
              Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Title */}
          <Textarea
            variant="editor"
            id="title"
            value={selectedCollection.title || "This collection doesn't have a title yet"}
            disabled
            placeholder="New Collection"
            className="text-4xl font-bold border-none p-0 resize-none overflow-hidden bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[44px]"
            rows={1}
            style={{ lineHeight: 1.2 }}
          />

          {/* Description */}
          {selectedCollection.description && (
            <Textarea
              variant="editor"
              id="description"
              value={selectedCollection.description}
              disabled
              placeholder="Enter collection description..."
              className="text-sm text-[var(--moonlight-silver)] border-none pb-8 resize-none overflow-hidden bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[32px]"
              rows={1}
              style={{ lineHeight: 1.3 }}
            />
          )}

          {/* Prompts in Collection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--moonlight-silver-bright)]">
              Prompts in this collection ({memoizedCollectionPrompts.length})
            </h3>
            {isLoadingPrompts ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border border-[var(--moonlight-silver-dim)]/20 rounded-lg p-4 animate-pulse">
                    <div className="h-5 bg-[var(--slate-grey)]/20 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-[var(--slate-grey)]/20 rounded w-1/2 mb-3"></div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <div className="h-5 bg-[var(--slate-grey)]/20 rounded w-12"></div>
                        <div className="h-5 bg-[var(--slate-grey)]/20 rounded w-16"></div>
                      </div>
                      <div className="h-8 bg-[var(--slate-grey)]/20 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : memoizedCollectionPrompts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[var(--moonlight-silver)]/60">No prompts in this collection yet.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {memoizedCollectionPrompts.map((prompt) => (
                  <div key={prompt.id} className="border border-[var(--moonlight-silver-dim)]/20 rounded-lg p-4 hover:bg-[var(--moonlight-silver-dim)]/5 transition-colors">
                    <h4 className="font-medium text-[var(--moonlight-silver-bright)] mb-2">{prompt.title}</h4>
                    {prompt.description && (
                      <p className="text-sm text-[var(--moonlight-silver)]/80 mb-3">{prompt.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {prompt.tags && prompt.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      <Link href={`/prompt/${prompt.id}`}>
                        <Button variant="ghost" size="sm" className="text-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/10">
                          <Eye size={14} />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          {selectedCollection.tags && selectedCollection.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {selectedCollection.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center bg-[var(--wisp-blue)]/20 text-[var(--wisp-blue)] border-[var(--wisp-blue)]/30 rounded-full px-3 py-1 text-sm font-medium gap-1"
                >
                  <span className="text-[var(--wisp-blue)] font-bold">#</span>
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[var(--moonlight-silver)]/60 pt-4 border-t border-[var(--moonlight-silver-dim)]/20">
            <div>Created: {new Date(selectedCollection.created_at).toLocaleDateString()}</div>
            <div>Updated: {new Date(selectedCollection.updated_at).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Prompt Read-Only View Component
function PromptReadOnlyView({ selectedPrompt, role }: { selectedPrompt: PromptData; role: user_role | null }) {
  const { actions } = useApp()

  return (
    <div className="flex flex-col bg-[var(--prompts)] h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[var(--moonlight-silver-dim)]/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-[var(--moonlight-silver)]" />
            <h1 className="text-xl font-semibold text-[var(--moonlight-silver-bright)]">View Prompt</h1>
          </div>
          <div className="flex items-center gap-1 text-sm text-[var(--moonlight-silver)]/60">
            <Lock size={14} />
            Read-only
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Button */}
          {!role && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  await actions.savePrompt(selectedPrompt.id)
                  toast.success("Prompt saved to your library")
                } catch {
                  toast.error("Failed to save prompt")
                }
                // Only reload relationships, not all data
                actions.loadUserRelationships()
              }}
              className="text-[var(--moonlight-silver)] hover:text-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/10"
            >
              <Save size={16} />
            </Button>
          )}
          {role && role !== "owner" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  await actions.deletePrompt(selectedPrompt.id)
                  toast.success("Prompt removed from your library")
                } catch {
                  toast.error("Failed to remove prompt")
                }
                // Only reload relationships, not all data
                actions.loadUserRelationships()
              }}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 size={16} />
            </Button>
          )}
          {/* Back to Home */}
          <Link href="/prompt">
            <Button
              variant="ghost"
              size="sm"
              className="text-[var(--moonlight-silver)] hover:text-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/10"
            >
              <Home size={16} />
              Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Title */}
          <Textarea
            variant="editor"
            id="title"
            value={selectedPrompt.title || "This prompt doesn't have a title yet"}
            disabled
            placeholder="New Prompt"
            className="text-4xl font-bold border-none p-0 resize-none overflow-hidden bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[44px]"
            rows={1}
            style={{ lineHeight: 1.2 }}
          />

          {/* Description */}
          {selectedPrompt.description && (
            <Textarea
              variant="editor"
              id="description"
              value={selectedPrompt.description}
              disabled
              placeholder="Enter prompt description..."
              className="text-sm text-[var(--moonlight-silver)] border-none pb-8 resize-none overflow-hidden bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[32px]"
              rows={1}
              style={{ lineHeight: 1.3 }}
            />
          )}

          {/* Prompt Content */}
          <Textarea
            variant="editor"
            id="content"
            value={selectedPrompt.content || "This prompt doesn't have any content"}
            placeholder="Enter prompt..."
            disabled
            className="disabled text-md font-bold text-gray-300 border-none pb-4 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[180px] overflow-hidden h-full"
          />

          {/* Tags */}
          {selectedPrompt.tags && selectedPrompt.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {selectedPrompt.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="flex items-center bg-[var(--wisp-blue)]/20 text-[var(--wisp-blue)] border-[var(--wisp-blue)]/30 rounded-full px-3 py-1 text-sm font-medium gap-1"
                >
                  <span className="text-[var(--wisp-blue)] font-bold">#</span>
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[var(--moonlight-silver)]/60 pt-4 border-t border-[var(--moonlight-silver-dim)]/20">
            <div>Created: {new Date(selectedPrompt.created_at).toLocaleDateString()}</div>
            <div>Updated: {new Date(selectedPrompt.updated_at).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PromptSlug() {
  const params = useParams()
  const { slug } = params
  const { state, actions } = useApp()
  const { user } = state

  const { selectedPrompt } = state.ui
  const [isLoading, setIsLoading] = useState(true)
  const [promptFound, setPromptFound] = useState(false)
  const [collectionFound, setCollectionFound] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<CollectionData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<user_role | null>(null)
  const [isCollection, setIsCollection] = useState(false)
  const [lastSlug, setLastSlug] = useState<string | null>(null)

  // Access check - memoized for performance
  const currentContent = isCollection ? selectedCollection : selectedPrompt
  const hasAccess = useMemo(() => {
    if (!currentContent) return false
    
    // Public content is always accessible
    if (currentContent.visibility === "public") return true
    
    // Check if user has any role
    if (role) return true
    
    // Private content requires ownership
    if (currentContent.visibility === "private") return role === "owner"
    
    return false
  }, [currentContent, role])

  // Validate slug format - treating it as prompt ID or collection ID
  useEffect(() => {
    if (!slug || typeof slug !== "string") {
      notFound()
      return
    }

    if (!user) {
      return
    }

    // Skip if this is the same slug we already processed
    if (slug === lastSlug) {
      return
    }

    // Initialize data and check permissions
    const initializeData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setLastSlug(slug)

        // Reset previous state
        setPromptFound(false)
        setCollectionFound(false)
        setSelectedCollection(null)
        setRole(null)
        setIsCollection(false)

        // First check if user has access to this slug in their relationships
        const hasPromptAccess = state.userRoles.prompts[slug] || state.userPrompts.includes(slug)
        const hasCollectionAccess = state.userRoles.collections[slug] || state.userCollections.includes(slug)

        // Use Promise.all to check both prompt and collection in parallel
        const [promptResult, collectionResult] = await Promise.all([
          Prompt.findById(slug).catch(() => null),
          Collection.findById(slug).catch(() => null)
        ])

        if (promptResult) {
          // Use cached role or fetch if not available
          const userRole = state.userRoles.prompts[slug] || (hasPromptAccess ? await UsersPrompts.getUserRole(slug, user.id) : null)
          setRole(userRole)
          actions.setSelectedPrompt(promptResult)
          setPromptFound(true)
          setIsCollection(false)
        } else if (collectionResult) {
          // Use cached role or fetch if not available
          const userRole = state.userRoles.collections[slug] || (hasCollectionAccess ? await UsersCollections.getUserRole(slug, user.id) : null)
          setRole(userRole)
          setSelectedCollection(collectionResult)
          setCollectionFound(true)
          setIsCollection(true)
        } else {
          setPromptFound(false)
          setCollectionFound(false)
        }
      } catch (error) {
        console.error("Error initializing data:", error)
        setError("An error occurred while loading the content")
        setPromptFound(false)
        setCollectionFound(false)
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()
  }, [slug, user?.id, user, actions, state.userRoles.prompts, state.userRoles.collections, state.userPrompts, state.userCollections, lastSlug])

  // Early return if user is not loaded yet - moved after all hooks
  if (!user) {
    return (
      <div className="flex flex-col bg-[var(--prompts)] h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--wisp-blue)]"></div>
        </div>
      </div>
    )
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col bg-[var(--prompts)] h-screen">
        {/* Header skeleton */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--moonlight-silver-dim)]/20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-[var(--slate-grey)]/30 rounded animate-pulse"></div>
              <div className="h-6 bg-[var(--slate-grey)]/30 rounded w-32 animate-pulse"></div>
            </div>
            <div className="h-5 bg-[var(--slate-grey)]/20 rounded w-20 animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 bg-[var(--slate-grey)]/30 rounded w-16 animate-pulse"></div>
            <div className="h-9 bg-[var(--slate-grey)]/30 rounded w-20 animate-pulse"></div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Title skeleton */}
            <div className="h-11 bg-[var(--slate-grey)]/20 rounded w-3/4 animate-pulse"></div>
            
            {/* Description skeleton */}
            <div className="h-6 bg-[var(--slate-grey)]/20 rounded w-1/2 animate-pulse"></div>
            
            {/* Content skeleton */}
            <div className="space-y-3">
              <div className="h-4 bg-[var(--slate-grey)]/20 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-[var(--slate-grey)]/20 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-[var(--slate-grey)]/20 rounded w-4/5 animate-pulse"></div>
              <div className="h-4 bg-[var(--slate-grey)]/20 rounded w-3/4 animate-pulse"></div>
            </div>
            
            {/* Tags skeleton */}
            <div className="flex gap-2">
              <div className="h-6 bg-[var(--slate-grey)]/20 rounded-full w-16 animate-pulse"></div>
              <div className="h-6 bg-[var(--slate-grey)]/20 rounded-full w-12 animate-pulse"></div>
              <div className="h-6 bg-[var(--slate-grey)]/20 rounded-full w-20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Content not found
  if (!promptFound && !collectionFound || error) {
    const contentType = isCollection ? "Collection" : "Prompt"
    return (
      <div className="flex flex-col bg-[var(--prompts)] h-screen">
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="bg-[var(--black)] border-[var(--moonlight-silver-dim)]/30 max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="h-16 w-16 rounded-lg mx-auto flex items-center justify-center bg-[var(--slate-grey)]/20">
                  <FileX className="h-8 w-8 text-[var(--moonlight-silver)]" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[var(--moonlight-silver-bright)] mb-2">{contentType} Not Found</h3>
              <p className="text-[var(--moonlight-silver)]/80 mb-6">
                {error || `The ${contentType.toLowerCase()} you're looking for doesn't exist or may have been removed.`}
              </p>
              <Link href="/prompt">
                <Button
                  size="lg"
                  className="bg-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/90 text-white font-semibold gap-2"
                >
                  <Home size={16} />
                  Return to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Access denied - early check for better performance
  if (
    currentContent &&
    !hasAccess
  ) {
    return (
      <div className="flex flex-col bg-[var(--prompts)] h-screen">
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="bg-[var(--black)] border-[var(--moonlight-silver-dim)]/30 max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="h-16 w-16 rounded-lg mx-auto flex items-center justify-center bg-[var(--slate-grey)]/20">
                  <Lock className="h-8 w-8 text-[var(--moonlight-silver)]" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[var(--moonlight-silver-bright)] mb-2">Access Denied</h3>
              <p className="text-[var(--moonlight-silver)]/80 mb-6">
                {`You don't have permission to view this ${isCollection ? 'collection' : 'prompt'}.`}
              </p>
              <Link href="/prompt">
                <Button
                  size="lg"
                  className="bg-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/90 text-white font-semibold gap-2"
                >
                  <Home size={16} />
                  Return to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show edit component for prompts with owner permissions
  if (!isCollection && selectedPrompt && role === "owner") {
    return <PromptEdit selectedPrompt={selectedPrompt} />
  }

  // Show collection view for collections or read-only prompt view
  if (isCollection && selectedCollection) {
    return <CollectionView selectedCollection={selectedCollection} role={role} />
  }

  if (!isCollection && selectedPrompt) {
    return <PromptReadOnlyView selectedPrompt={selectedPrompt} role={role} />
  }

  return null
}
