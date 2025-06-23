'use client'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Star
} from 'lucide-react'

export interface PromptData {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  isFavorite: boolean
  isDeleted: boolean
  isSaved: boolean
  isOwner: boolean
  isPublic?: boolean
  createdAt: string
  lastUsed: string
  usage: number
  content: string
}

interface PromptListCardProps {
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

export default function PromptListCard({ 
  prompt, 
  isSelected,
  isLast,
  isBeforeSelected,
  onSelect,
  onToggleFavorite,
  isOwner
}: PromptListCardProps) {
  const getBorderClass = () => {
    if (isSelected) {
      return 'bg-[var(--flare-cyan)]/50 border-transparent shadow-sm shadow-[var(--glow-ember)]/5 rounded-sm'
    }
    
    const shouldHideBorder = isLast || isBeforeSelected
    return shouldHideBorder 
      ? 'bg-transparent border-transparent rounded-none'
      : 'bg-transparent border-b-[var(--flare-cyan)] border-x-transparent border-t-transparent rounded-none'
  }

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${getBorderClass()}`}
      onClick={onSelect}
    >
      <CardHeader className="pb-0 pt-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <CardTitle className="text-sm text-[var(--moonlight-silver-bright)] truncate">
                {prompt.title}
              </CardTitle>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite(prompt.id)
                  }}
                  className="p-0.5 transition-colors hover:bg-transparent"
                >
                  <Star 
                    size={11} 
                    className={`${
                      prompt.isFavorite 
                        ? 'text-[var(--glow-ember)] fill-current' 
                        : 'text-[var(--moonlight-silver-bright)]'
                    } transition-colors`}
                  />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mb-0.5">
              {/* Prompt type identifier */}
              {prompt.isSaved && !isOwner ? (
                <span className="text-xs bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded-full font-medium">
                  Saved
                </span>
              ) : isOwner && prompt.isPublic ? (
                <span className="text-xs bg-cyan-500/20 text-cyan-400 px-1 py-0.5 rounded-full font-medium">
                  Public
                </span>
              ) : isOwner ? (
                <span className="text-xs bg-green-500/20 text-green-400 px-1 py-0.5 rounded-full font-medium">
                  Private
                </span>
              ) : (
                <span className="text-xs bg-gray-500/20 text-gray-400 px-1 py-0.5 rounded-full font-medium">
                  Public
                </span>
              )}
              {prompt.isDeleted && (
                <span className="text-xs bg-red-500/20 text-red-400 px-1 py-0.5 rounded-full font-medium">
                  Deleted
                </span>
              )}
            </div>
            <CardDescription className="text-xs text-[var(--moonlight-silver)] line-clamp-1">
              {prompt.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
