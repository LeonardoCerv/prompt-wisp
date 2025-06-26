'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Star, 
  Copy,
  Save,
  Hash,
  Clock,
  Folder,
  Share,
  Eye,
} from 'lucide-react'
import Link from 'next/link'
import { PromptData } from '@/lib/models/prompt'
import { useApp } from '@/contexts/appContext'

interface PromptSlugPreviewProps {
  selectedPrompt: PromptData | null
  onToggleFavorite?: (id: string) => void
  onCopy: (content: string, title: string) => void
  onSave?: (id: string) => void
  currentFilter?: string
  user?: {
    id: string
    email?: string
  }
}

export default function PromptSlugPreview({
  selectedPrompt,
  onToggleFavorite,
  onCopy,
  onSave,
  currentFilter,
  user
}: PromptSlugPreviewProps) {

  const {utils} = useApp()
  const [showFullContent, setShowFullContent] = useState(false)



  // Auto-expand content if it's not too long
  useEffect(() => {
    if (selectedPrompt && selectedPrompt.content.length < 1000) {
      setShowFullContent(true)
    }
  }, [selectedPrompt])

  // Generate directory path based on how the prompt was accessed
  const getDirectoryPath = () => {
    if (!selectedPrompt) return ''
    
    const filterMap: Record<string, string> = {
      'all-prompts': 'All Prompts',
      'favorites': 'Favorites',
      'your-prompts': 'Your Prompts',
      'saved': 'Saved',
      'deleted': 'Deleted'
    }
    
    // Determine the primary category based on prompt properties
    let category = 'All Prompts'
    
    if (currentFilter && currentFilter !== 'all' && filterMap[currentFilter]) {
      category = filterMap[currentFilter]
    } else {
      // Fallback logic based on prompt properties
      if (selectedPrompt.deleted || selectedPrompt.deleted) {
        category = 'Deleted'
      } else if (utils.isSaved(selectedPrompt.id) && selectedPrompt.user_id !== user?.id) {
        category = 'Saved'
      } else if (utils.isFavorite(selectedPrompt.id)) {
        category = 'Favorites'
      } else if (selectedPrompt.user_id === user?.id) {
        category = 'Your Prompts'
      }
    }
    
    return `${category}/${selectedPrompt.title || 'Untitled'}`
  }

  const getStatusBadge = () => {
    if (!selectedPrompt) return null
    
    if (selectedPrompt.deleted || selectedPrompt.deleted) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/20 text-red-400 border border-red-800/30">
          Deleted
        </span>
      )
    }
    
    if (selectedPrompt.visibility === 'private') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-900/20 text-yellow-400 border border-yellow-800/30">
          Private
        </span>
      )
    }
    
    if (selectedPrompt.visibility === 'unlisted') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/20 text-blue-400 border border-blue-800/30">
          Unlisted
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-400 border border-green-800/30">
        Public
      </span>
    )
  }

  return (
    <div className="flex flex-col bg-[var(--prompts)] h-screen">
      {selectedPrompt ? (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--moonlight-silver-dim)]/30">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Folder size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-400 truncate font-medium opacity-80">{getDirectoryPath()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getStatusBadge()}
              
              <span className="text-xs text-[var(--moonlight-silver)] flex items-center gap-1">
                <Clock size={12} />
                {new Date(selectedPrompt.updated_at).toLocaleDateString()}
              </span>

              {onToggleFavorite && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onToggleFavorite(selectedPrompt.id)}
                  className={`p-1.5 ${
                    utils.isFavorite(selectedPrompt.id)
                      ? 'text-[var(--glow-ember)] hover:text-[var(--glow-ember)]/80' 
                      : 'text-[var(--moonlight-silver)] hover:text-[var(--moonlight-silver-bright)]'
                  }`}
                >
                  <Star size={16} className={utils.isFavorite(selectedPrompt.id) ? 'fill-current' : ''} />
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  // Share functionality - copy link to clipboard
                  const shareUrl = `${window.location.origin}/prompt/${selectedPrompt.id}`
                  navigator.clipboard.writeText(shareUrl)
                  // You might want to show a toast notification here
                }}
                className="p-1.5 text-[var(--moonlight-silver)] hover:text-[var(--moonlight-silver-bright)]"
              >
                <Share size={16} />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCopy(selectedPrompt.content, selectedPrompt.title)}
                className="p-1.5 text-[var(--moonlight-silver)] hover:text-[var(--moonlight-silver-bright)]"
              >
                <Copy size={16} />
              </Button>
            </div>
          </div>

          {/* Content - Read-only view */}
          <div className="flex-1 p-4 space-y-6 overflow-y-auto">
            {/* Title and Author */}
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-white leading-tight">
                {selectedPrompt.title || 'Untitled Prompt'}
              </h1>
              
              {/* Author info 
              <div className="flex items-center gap-2 text-sm text-[var(--moonlight-silver)]">
                <User size={14} />
                <span>Created by {selectedPrompt.profiles?.full_name || selectedPrompt.profiles?.username || 'Anonymous'}</span>
                <span>•</span>
                <span>{new Date(selectedPrompt.created_at).toLocaleDateString()}</span>
              </div>
              */}
            </div>

            {/* Description */}
            {selectedPrompt.description && (
              <div className="space-y-2 border-l-2 border-[var(--moonlight-silver-dim)]/30 pl-4">
                <label className="text-xs font-medium text-[var(--moonlight-silver)]/80 uppercase tracking-wide">
                  Description
                </label>
                <p className="text-base text-[var(--moonlight-silver-bright)] leading-relaxed">
                  {selectedPrompt.description}
                </p>
              </div>
            )}

            {/* Main Content */}
            <div className="space-y-3 bg-[var(--moonlight-silver-dim)]/5 rounded-lg p-6 border border-[var(--moonlight-silver-dim)]/20">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[var(--moonlight-silver)]/80 uppercase tracking-wide">
                  Prompt Content
                </label>
                <div className="flex items-center gap-2">
                  {selectedPrompt.content.length > 1000 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowFullContent(!showFullContent)}
                      className="p-1.5 text-[var(--moonlight-silver)] hover:text-[var(--moonlight-silver-bright)]"
                    >
                      <Eye size={14} />
                      <span className="ml-1 text-xs">
                        {showFullContent ? 'Show Less' : 'Show More'}
                      </span>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onCopy(selectedPrompt.content, selectedPrompt.title)}
                    className="p-1.5 text-[var(--moonlight-silver)] hover:text-[var(--moonlight-silver-bright)]"
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <pre className={`whitespace-pre-wrap font-mono text-[var(--moonlight-silver-bright)] leading-relaxed ${
                  !showFullContent && selectedPrompt.content.length > 1000 
                    ? 'max-h-80 overflow-hidden' 
                    : ''
                }`}>
                  {selectedPrompt.content}
                </pre>
                
                {!showFullContent && selectedPrompt.content.length > 1000 && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--moonlight-silver-dim)]/10 to-transparent pointer-events-none" />
                )}
              </div>
            </div>

            {/* Tags */}
            {selectedPrompt.tags && selectedPrompt.tags.length > 0 && (
              <div className="border-t border-[var(--moonlight-silver-dim)]/30 pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Hash size={14} className="text-[var(--moonlight-silver)]" />
                    <label className="text-xs font-medium text-[var(--moonlight-silver)]/80 uppercase tracking-wide">Tags</label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrompt.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--moonlight-silver-dim)]/20 text-[var(--moonlight-silver-bright)] border border-[var(--moonlight-silver-dim)]/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[var(--moonlight-silver-dim)]/30 p-4">
            <div className="flex justify-between items-center">
              <Link 
                href="/prompt"
                className="text-sm text-[var(--moonlight-silver)] hover:text-[var(--moonlight-silver-bright)] transition-colors"
              >
                ← Back to prompts
              </Link>

              <div className="flex items-center gap-2">
                {onSave && selectedPrompt.user_id !== user?.id && !selectedPrompt.deleted && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSave(selectedPrompt.id)}
                    className={`text-xs border-[var(--moonlight-silver-dim)] ${
                      utils.isSaved(selectedPrompt.id)
                        ? 'text-[var(--glow-ember)] border-[var(--glow-ember)]/50' 
                        : 'text-[var(--moonlight-silver-bright)] hover:bg-[var(--slate-grey)]'
                    }`}
                  >
                    <Save size={12} className="mr-1" />
                    {utils.isSaved(selectedPrompt.id) ? 'Saved' : 'Save'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="h-16 w-16 rounded-lg mx-auto flex items-center justify-center">
                <Eye className="h-8 w-8 text-[var(--moonlight-silver)]" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-[var(--glow-ember)] rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">!</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-[var(--moonlight-silver-bright)] mb-2">
              Prompt not found
            </h3>
            <p className="text-[var(--moonlight-silver)]/80 max-w-sm mb-4">
              This prompt may have been deleted or you don't have permission to view it.
            </p>
            <Link 
              href="/prompt"
              className="text-[var(--glow-ember)] hover:text-[var(--glow-ember)]/80 transition-colors"
            >
              ← Back to prompts
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
