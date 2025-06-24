'use client'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Star,
  Lock,
  Globe,
  Bookmark,
  Trash2
} from 'lucide-react'
import { PromptData } from './promptProvider'

interface PromptCardProps {
  prompt: PromptData
  isSelected: boolean
  isLast: boolean
  isBeforeSelected: boolean
  onSelect: () => void
  onToggleFavorite: (id: string) => void
  onCopy: (content: string, title: string) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
  onSave: (id: string) => void
  isOwner: boolean
}

export default function PromptCard({ 
  prompt, 
  isSelected,
  isLast,
  isBeforeSelected,
  onSelect,
  onToggleFavorite,
  isOwner
}: PromptCardProps) {
  const getBorderClass = () => {
    if (isSelected) {
      return 'bg-[var(--flare-cyan)]/30 border-transparent shadow-sm rounded-sm px-3'
    }
    
    const shouldHideBorder = isLast || isBeforeSelected
    return shouldHideBorder 
      ? 'bg-transparent border-transparent rounded-none mx-4 px-0'
      : 'bg-transparent border-b-[var(--ash-grey)] border-x-transparent border-t-transparent rounded-none mx-4 px-0'
  }


  const toggleFavorite = (id: string) => {
    try {
      const response = await fetch('/api/prompts/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId: id })
      })

      if (response.ok) {
        const { isFavorite } = await response.json()
        setPrompts(prev => prev.map(p =>
          p.id === id ? { ...p, isFavorite } : p
        ))
        
        // Update selected prompt if it's the same one
        if (selectedPrompt?.id === id) {
          setSelectedPrompt(prev => prev ? { ...prev, isFavorite } : null)
        }
      } else {
        toast.error('Failed to toggle favorite')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to toggle favorite')
    }
  }

  const getStatusIcon = () => {
    if (prompt.isDeleted) {
      return <Trash2 size={14} className="text-[var(--ash-grey)]" />
    }
    
    if (prompt.isSaved && !isOwner) {
      return <Bookmark size={14} className="text-[var(--ash-grey)]" />
    }
    
    if (isOwner && prompt.isPublic) {
      return <Globe size={14} className="text-[var(--ash-grey)]" />
    }
    
    if (isOwner) {
      return <Lock size={14} className="text-[var(--ash-grey)]" />
    }
    
    return <Globe size={14} className="text-[var(--ash-grey)]" />
  }

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${getBorderClass()}`}
      onClick={onSelect}
    >
      <CardHeader className="pb-0 pt-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <CardTitle 
              className="text-sm font-bold text-[var(--soft-white)] truncate"
              title={prompt.title}
            >
              {prompt.title}
            </CardTitle>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(prompt.id)
              }}
              className="p-0.5 transition-colors hover:bg-transparent ml-4"
            >
              <Star 
                size={11} 
                className={`${
                  prompt.isFavorite 
                    ? 'text-[var(--glow-ember)] fill-current' 
                    : 'text-[var(--ash-grey)]'
                } transition-colors`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <CardDescription 
              className="text-xs text-neutral-500 line-clamp-1 flex-1"
              title={prompt.description || undefined}
            >
              {prompt.description || ''}
            </CardDescription>
            {/* Status Icon */}
            <div className="flex-shrink-0 ml-4">
              {getStatusIcon()}
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
