'use client'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Star,
  Lock,
  Globe,
  Bookmark,
  Trash2
} from 'lucide-react'
import { PromptData } from '@/lib/models/prompt'
import { toggleFavoritePrompt } from './actions'

interface PromptCardProps {
  prompt: PromptData
  isSelected: boolean
  isLast: boolean
  isBeforeSelected: boolean
  onSelect: () => void
  isOwner: boolean
  isFavorite: boolean
}

export default function PromptCard({ 
  prompt, 
  isSelected,
  isLast,
  isBeforeSelected,
  onSelect,
  isOwner,
  isFavorite
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

  const getStatusIcon = () => {
    if (prompt.deleted) {
      return <Trash2 size={14} className="text-[var(--ash-grey)]" />
    }
    
    if (!isOwner) {
      return <Bookmark size={14} className="text-[var(--ash-grey)]" />
    }
    
    if (isOwner && prompt.visibility === 'public') {
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
              onClick={async (e) => {
                e.stopPropagation()
                await toggleFavoritePrompt(prompt.id, !isFavorite)
              }}
              className="p-0.5 transition-colors hover:bg-transparent ml-4"
            >
              <Star 
                size={11}
                className={`${
                  isFavorite 
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
