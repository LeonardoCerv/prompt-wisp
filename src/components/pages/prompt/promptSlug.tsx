'use client'

import { useEffect, useState } from 'react'
import { usePromptContext } from '@/components/promptContext'
import PromptEdit from '@/components/promptEdit'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, FileX } from 'lucide-react'
import Link from 'next/link'

interface PromptSlugPageProps {
  slug: string
}

export default function PromptSlugPage({ slug }: PromptSlugPageProps) {
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
    updatePrompt
  } = usePromptContext()
  
  const [isLoading, setIsLoading] = useState(true)
  const [promptFound, setPromptFound] = useState(false)

  useEffect(() => {
    if (slug && prompts.length > 0) {
      const prompt = prompts.find(p => p.id === slug)
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
    } else if (slug && prompts.length === 0) {
      // Still loading prompts
      setIsLoading(true)
    }
  }, [slug, prompts, selectPrompt, activeFilter, setActiveFilter, isOwner])

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
                The prompt you're looking for doesn't exist or may have been removed.
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
    />
  )
}