'use client'

import { useEffect, useState } from 'react'
import PromptEdit from '@/components/promptEdit'
import PromptSlugPreview from '@/components/promptPreview'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, FileX } from 'lucide-react'
import Link from 'next/link'
import { 
  savePrompt, 
  deletePrompt, 
  restorePrompt, 
  copyToClipboard, 
  toggleFavorite,
  refreshPrompts,
} from '@/components/navbar'
import { PromptData } from '@/lib/models/prompt'

// Extended interface for transformed prompt data
interface ExtendedPromptData extends PromptData {
  isOwner: boolean
  isFavorite: boolean
  isSaved: boolean
  isDeleted?: boolean
}

interface PromptSlugPageProps {
  slug: string
  promptData?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  user: {
    id: string
    email?: string
  }
}

export default function PromptSlugPage({ slug, promptData, user }: PromptSlugPageProps) {
  const [prompts, setPrompts] = useState<ExtendedPromptData[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<ExtendedPromptData | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [promptFound, setPromptFound] = useState(false)

  // Helper function to safely parse dates
  const safeParseDate = (dateString: any): string => {
    if (!dateString) return new Date().toISOString()
    
    try {
      console.log('Original date input:', dateString, 'Type:', typeof dateString)
      
      // If it's already a valid ISO string, return it
      if (typeof dateString === 'string' && dateString.includes('T') && dateString.includes('Z')) {
        const testDate = new Date(dateString)
        if (!isNaN(testDate.getTime())) {
          console.log('Already valid ISO string:', dateString)
          return dateString
        }
      }
      
      let parsedDate: Date
      
      if (typeof dateString === 'string') {
        // Handle PostgreSQL timestamp format: "2025-06-24 20:19:11.559614+00"
        let normalizedDate = dateString.trim()
        
        // If it has timezone offset like +00 or -05, convert to proper format
        if (normalizedDate.includes('+') || normalizedDate.match(/-\d{2}$/)) {
          // Replace space with T for ISO format
          normalizedDate = normalizedDate.replace(' ', 'T')
          
          // Handle timezone: +00 -> Z, +05:30 -> +05:30, etc.
          if (normalizedDate.endsWith('+00')) {
            normalizedDate = normalizedDate.replace('+00', 'Z')
          } else if (normalizedDate.match(/[+-]\d{2}$/)) {
            // Add :00 to timezone if missing (e.g., +05 -> +05:00)
            normalizedDate = normalizedDate + ':00'
          }
        } else if (!normalizedDate.includes('T')) {
          // If no timezone info, assume UTC and add Z
          normalizedDate = normalizedDate.replace(' ', 'T') + 'Z'
        }
        
        // Trim microseconds to 3 digits (milliseconds) if they exist
        normalizedDate = normalizedDate.replace(/(\.\d{3})\d{3}/, '$1')
        
        console.log('Normalized date:', normalizedDate)
        parsedDate = new Date(normalizedDate)
      } else {
        // Try direct parsing for non-string inputs
        parsedDate = new Date(dateString)
      }
      
      if (isNaN(parsedDate.getTime())) {
        console.warn('Failed to parse date:', dateString, 'Using current date as fallback')
        return new Date().toISOString()
      }
      
      const result = parsedDate.toISOString()
      console.log('Successfully parsed date. Final result:', result)
      return result
    } catch (error) {
      console.error('Error parsing date:', dateString, 'Error:', error)
      return new Date().toISOString()
    }
  }

  // Helper functions
  const selectPrompt = (prompt: ExtendedPromptData | null) => {
    setSelectedPrompt(prompt)
  }

  const isOwner = (prompt: PromptData) => {
    return prompt.user_id === user.id
  }

  const updatePrompt = async (id: string, updates: Partial<PromptData>) => {
    try {
      // Update the prompt via API
      const response = await fetch(`/api/prompts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates })
      })

      if (response.ok) {
        const updated = await response.json()
        if (selectedPrompt) {
          setSelectedPrompt({ ...selectedPrompt, ...updated })
        }
        // Refresh prompts list
        loadPrompts()
      }
    } catch (error) {
      console.error('Error updating prompt:', error)
    }
  }

  // Wrapper functions for navbar functions to match expected signatures
  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id)
    loadPrompts() // Refresh to get updated data
  }

  const handleCopyToClipboard = (content: string, title: string) => {
    copyToClipboard(content, title)
  }

  const handleSavePrompt = (id: string) => {
    savePrompt(id)
    loadPrompts() // Refresh to get updated data
  }

  const handleDeletePrompt = (id: string) => {
    deletePrompt(id)
    loadPrompts() // Refresh to get updated data
  }

  const handleRestorePrompt = (id: string) => {
    restorePrompt(id)
    loadPrompts() // Refresh to get updated data
  }

  const loadPrompts = async () => {
    setLoading(true)
    try {
      const userPrompts = await refreshPrompts()
      // Transform prompts to ExtendedPromptData format
      const transformedPrompts = userPrompts.map((prompt: any) => ({
        ...prompt,
        created_at: safeParseDate(prompt.created_at),
        updated_at: safeParseDate(prompt.updated_at),
        isOwner: prompt.user_id === user.id,
        isFavorite: prompt.is_favorite || false,
        isSaved: prompt.is_saved || false,
        isDeleted: prompt.deleted || false
      }))
      setPrompts(transformedPrompts)
    } catch (error) {
      console.error('Error loading prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Load prompts first
    loadPrompts()
  }, [user.id]) // Add user.id as dependency

  useEffect(() => {
    // If we have server-side data, use it immediately
    if (promptData) {
      const transformedPrompt: ExtendedPromptData = {
        id: promptData.id,
        title: promptData.title,
        description: promptData.description || null,
        content: promptData.content,
        tags: promptData.tags || [],
        created_at: safeParseDate(promptData.created_at),
        updated_at: safeParseDate(promptData.updated_at),
        user_id: promptData.user_id,
        images: promptData.images || null,
        collaborators: promptData.collaborators || null,
        visibility: promptData.visibility || 'private',
        deleted: promptData.deleted || false,
        collections: promptData.collections || null,
        isOwner: promptData.user_id === user.id,
        isFavorite: promptData.is_favorite || false,
        isSaved: promptData.is_saved || false,
        isDeleted: promptData.deleted || false
      }
      
      selectPrompt(transformedPrompt)
      
      // Set appropriate filter based on prompt characteristics for direct URL access
      if (activeFilter === 'all') {
        if (transformedPrompt.isDeleted) {
          setActiveFilter('deleted')
        } else if (transformedPrompt.isFavorite) {
          setActiveFilter('favorites')
        } else if (isOwner(transformedPrompt)) {
          setActiveFilter('your-prompts')
        } else if (transformedPrompt.isSaved) {
          setActiveFilter('saved')
        } else {
          setActiveFilter('all-prompts')
        }
      }
      
      setPromptFound(true)
      setIsLoading(false)
      return
    }

    // Fallback to client-side lookup if no server data
    if (slug && prompts.length > 0 && !loading) {
      const prompt = prompts.find(p => p.id === slug) // Using id instead of slug
      if (prompt) {
        selectPrompt(prompt)
        
        // Only set filter if we're currently on 'all' (direct URL access)
        if (activeFilter === 'all') {
          // Determine appropriate filter based on prompt characteristics
          if (prompt.isDeleted) {
            setActiveFilter('deleted')
          } else if (prompt.isFavorite) {
            setActiveFilter('favorites')
          } else if (isOwner(prompt)) {
            setActiveFilter('your-prompts')
          } else if (prompt.isSaved) {
            setActiveFilter('saved')
          } else {
            setActiveFilter('all-prompts')
          }
        }
        
        setPromptFound(true)
      } else {
        setPromptFound(false)
      }
      setIsLoading(false)
    } else if (slug && !loading && prompts.length === 0) {
      // No prompts loaded and not loading - prompt not found
      setPromptFound(false)
      setIsLoading(false)
    }
  }, [slug, prompts, activeFilter, loading, promptData, user.id])

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col bg-[var(--prompts)] h-screen p-6">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-8 bg-[var(--slate-grey)]/30 rounded w-32"></div>
              <div className="h-6 bg-[var(--slate-grey)]/20 rounded w-20"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-9 bg-[var(--slate-grey)]/30 rounded w-20"></div>
              <div className="h-9 bg-[var(--slate-grey)]/30 rounded w-20"></div>
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="space-y-4">
            <div className="h-4 bg-[var(--slate-grey)]/20 rounded w-3/4"></div>
            <div className="h-4 bg-[var(--slate-grey)]/20 rounded w-1/2"></div>
            <div className="h-32 bg-[var(--slate-grey)]/20 rounded w-full"></div>
            <div className="h-4 bg-[var(--slate-grey)]/20 rounded w-2/3"></div>
            <div className="h-4 bg-[var(--slate-grey)]/20 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    )
  }

  // Prompt not found
  if (!promptFound) {
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
              <h3 className="text-xl font-semibold text-[var(--moonlight-silver-bright)] mb-2">
                Prompt Not Found
              </h3>
              <p className="text-[var(--moonlight-silver)]/80 mb-6">
                The prompt you&apos;re looking for doesn&apos;t exist or may have been removed.
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

  // Render the appropriate component based on user permissions
  // Check if user can edit this prompt:
  // - User must be the owner OR a collaborator
  // - Prompt must NOT be soft deleted
  const canEdit = selectedPrompt && (
    isOwner(selectedPrompt) || 
    (selectedPrompt.collaborators && selectedPrompt.collaborators.includes(user.id))
  ) && !selectedPrompt.deleted

  // Show edit component for users with edit permissions
  if (canEdit) {
    return (
      <PromptEdit
        selectedPrompt={selectedPrompt}
        onToggleFavorite={handleToggleFavorite}
        onCopy={handleCopyToClipboard}
        onSave={handleSavePrompt}
        onDelete={handleDeletePrompt}
        onRestore={handleRestorePrompt}
        onUpdatePrompt={updatePrompt}
        isOwner={isOwner}
        currentFilter={activeFilter}
      />
    )
  }

  // Show preview component for read-only access:
  // - Non-owners/non-collaborators  
  // - Owners viewing soft-deleted prompts
  // - Any user viewing public/shared prompts
  return (
    <PromptSlugPreview
      selectedPrompt={selectedPrompt}
      onToggleFavorite={handleToggleFavorite}
      onCopy={handleCopyToClipboard}
      onSave={handleSavePrompt}
      currentFilter={activeFilter}
      user={user}
    />
  )
}