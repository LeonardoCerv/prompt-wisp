'use client'

import { useEffect, useState } from 'react'
import PromptEdit from '@/components/promptEdit'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, FileX } from 'lucide-react'
import Link from 'next/link'
import { usePromptContext } from '@/components/promptContext'

interface PromptSlugPageProps {
  slug: string
  promptData?: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function PromptSlugPage({ slug, promptData }: PromptSlugPageProps) {
  const { 
    prompts, 
    selectPrompt, 
    selectedPrompt,
    activeFilter, 
    setActiveFilter, 
    isOwner,
    toggleFavorite,
    copyToClipboard,
    savePrompt,
    deletePrompt,
    restorePrompt,
    updatePrompt,
    loading
  } = usePromptContext()
  
  const [isLoading, setIsLoading] = useState(true)
  const [promptFound, setPromptFound] = useState(false)

  useEffect(() => {
    // If we have server-side data, use it immediately
    if (promptData) {
      const transformedPrompt = {
        id: promptData.id,
        slug: promptData.slug,
        title: promptData.title,
        description: promptData.description,
        tags: promptData.tags,
        isFavorite: promptData.is_favorite,
        isDeleted: promptData.is_deleted,
        isSaved: promptData.is_saved,
        isOwner: promptData.is_owner,
        isPublic: promptData.is_public,
        createdAt: new Date(promptData.created_at).toISOString().split('T')[0],
        lastUsed: new Date(promptData.last_used_at).toISOString().split('T')[0],
        content: promptData.content,
        user_id: promptData.user_id,
        profile: promptData.profile
      }
      
      selectPrompt(transformedPrompt)
      setPromptFound(true)
      setIsLoading(false)
      return
    }

    // Fallback to client-side lookup if no server data
    if (slug && prompts.length > 0 && !loading) {
      const prompt = prompts.find(p => p.slug === slug)
      if (prompt) {
        selectPrompt(prompt)
        
        // Only set filter if we're currently on 'all' (direct URL access)
        // This preserves the user's current filter when navigating from a filtered list
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
  }, [slug, prompts, selectPrompt, activeFilter, setActiveFilter, isOwner, loading, promptData])

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

  // Render the prompt edit component
  return (
    <PromptEdit
      selectedPrompt={selectedPrompt}
      onToggleFavorite={toggleFavorite}
      onCopy={copyToClipboard}
      onSave={savePrompt}
      onDelete={deletePrompt}
      onRestore={restorePrompt}
      onUpdatePrompt={updatePrompt}
      isOwner={isOwner}
      currentFilter={activeFilter}
    />
  )
}