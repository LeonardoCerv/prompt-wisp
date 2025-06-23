'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Star, 
  Calendar, 
  Eye, 
  Copy,
  Save,
  Edit,
  Trash2,
  RotateCcw,
  MoreHorizontal,
  Hash,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { PromptData } from './prompt-list-card'

interface PromptEditProps {
  selectedPrompt: PromptData | null
  onToggleFavorite: (id: string) => void
  onCopy: (content: string, title: string) => void
  onSave: (id: string) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
  isOwner: (prompt: PromptData) => boolean
  onUpdatePrompt?: (id: string, updates: Partial<PromptData>) => void
}

export default function PromptEdit({
  selectedPrompt,
  onToggleFavorite,
  onCopy,
  onSave,
  onDelete,
  onRestore,
  isOwner,
  onUpdatePrompt
}: PromptEditProps) {
  const [editedTitle, setEditedTitle] = useState('')
  const [editedContent, setEditedContent] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedTags, setEditedTags] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  // Update local state when selectedPrompt changes
  useEffect(() => {
    if (selectedPrompt) {
      setEditedTitle(selectedPrompt.title)
      setEditedContent(selectedPrompt.content)
      setEditedDescription(selectedPrompt.description)
      setEditedTags(selectedPrompt.tags)
    }
  }, [selectedPrompt])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedPrompt || !isOwner(selectedPrompt)) return

      // Cmd/Ctrl + S to save
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault()
        handleSave()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedPrompt])

  // Auto-focus title on mount
  useEffect(() => {
    if (selectedPrompt && titleRef.current) {
      titleRef.current.focus()
    }
  }, [selectedPrompt])

  // Auto-resize textareas
  const autoResizeTextarea = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto'
    element.style.height = element.scrollHeight + 'px'
  }

  // Handle saving changes
  const handleSave = async () => {
    if (!selectedPrompt || !onUpdatePrompt) return
    
    setIsSaving(true)
    try {
      await onUpdatePrompt(selectedPrompt.id, {
        title: editedTitle,
        content: editedContent,
        description: editedDescription,
        tags: editedTags
      })
    } catch (error) {
      console.error('Failed to save changes:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle tag editing
  const handleTagEdit = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    setEditedTags(tags)
  }

  return (
    <div className="flex flex-col bg-[var(--prompts)] h-screen">
      {selectedPrompt ? (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--moonlight-silver-dim)]/30">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onToggleFavorite(selectedPrompt.id)}
                className={`p-1.5 ${
                  selectedPrompt.isFavorite 
                    ? 'text-[var(--glow-ember)] hover:text-[var(--glow-ember)]/80' 
                    : 'text-[var(--moonlight-silver)] hover:text-[var(--moonlight-silver-bright)]'
                }`}
              >
                <Star size={16} className={selectedPrompt.isFavorite ? 'fill-current' : ''} />
              </Button>
              
              <span className="text-xs bg-[var(--glow-ember)]/20 text-[var(--glow-ember)] px-2 py-1 rounded-full font-medium">
                {selectedPrompt.category}
              </span>
              
              <span className="text-xs text-[var(--moonlight-silver)]/80 font-medium">
                • Editing
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCopy(selectedPrompt.content, selectedPrompt.title)}
                className="p-1.5 text-[var(--moonlight-silver)] hover:text-[var(--moonlight-silver-bright)]"
              >
                <Copy size={16} />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="p-1.5 text-[var(--moonlight-silver)] hover:text-[var(--moonlight-silver-bright)]"
              >
                <MoreHorizontal size={16} />
              </Button>
            </div>
          </div>

          {/* Content - Always in edit mode */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Title */}
            <textarea
              ref={titleRef}
              value={editedTitle}
              onChange={(e) => {
                setEditedTitle(e.target.value)
                autoResizeTextarea(e.target)
              }}
              className="w-full text-2xl font-bold text-white bg-transparent border-none outline-none resize-none placeholder-[var(--moonlight-silver)] leading-tight"
              placeholder="Untitled prompt..."
              style={{ minHeight: '40px' }}
            />

            {/* Description */}
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full text-[var(--moonlight-silver)] bg-transparent border-none outline-none resize-none placeholder-[var(--moonlight-silver)]/60"
              placeholder="Add a description..."
              rows={2}
            />

            {/* Main Content */}
            <div className="flex-1">
              <textarea
                ref={contentRef}
                value={editedContent}
                onChange={(e) => {
                  setEditedContent(e.target.value)
                  autoResizeTextarea(e.target)
                }}
                className="w-full text-[var(--moonlight-silver-bright)] bg-transparent border-none outline-none resize-none leading-relaxed placeholder-[var(--moonlight-silver)]/60"
                placeholder="Start writing your prompt..."
                style={{ minHeight: '200px' }}
              />
            </div>

            {/* Tags */}
            <div className="border-t border-[var(--moonlight-silver-dim)]/30 pt-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Hash size={14} className="text-[var(--moonlight-silver)]" />
                  <span className="text-sm text-[var(--moonlight-silver)]">Tags</span>
                </div>
                <input
                  type="text"
                  value={editedTags.join(', ')}
                  onChange={(e) => handleTagEdit(e.target.value)}
                  className="w-full text-sm text-[var(--moonlight-silver-bright)] bg-transparent border border-[var(--moonlight-silver-dim)]/50 rounded px-3 py-2 outline-none focus:border-[var(--glow-ember)]/50"
                  placeholder="Add tags separated by commas..."
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[var(--moonlight-silver-dim)]/30 p-4">
            {/* Save Actions */}
            <div className="flex justify-between items-center mb-3">
              <Link 
                href="/prompt"
                className="text-sm text-[var(--moonlight-silver)] hover:text-[var(--moonlight-silver-bright)] transition-colors"
              >
                ← Back to prompts
              </Link>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[var(--glow-ember)] hover:bg-[var(--glow-ember)]/90 text-white"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-[var(--moonlight-silver)]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Eye size={12} />
                  {selectedPrompt.usage} uses
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(selectedPrompt.lastUsed).toLocaleDateString()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {!isOwner(selectedPrompt) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSave(selectedPrompt.id)}
                    className={`text-xs border-[var(--moonlight-silver-dim)] ${
                      selectedPrompt.isSaved 
                        ? 'text-[var(--glow-ember)] border-[var(--glow-ember)]/50' 
                        : 'text-[var(--moonlight-silver-bright)] hover:bg-[var(--slate-grey)]'
                    }`}
                  >
                    <Save size={12} className="mr-1" />
                    {selectedPrompt.isSaved ? 'Saved' : 'Save'}
                  </Button>
                )}

                {isOwner(selectedPrompt) && (
                  <>
                    {selectedPrompt.isDeleted ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRestore(selectedPrompt.id)}
                        className="text-xs border-green-500/50 text-green-400 hover:bg-green-500/10"
                      >
                        <RotateCcw size={12} className="mr-1" />
                        Restore
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(selectedPrompt.id)}
                        className="text-xs border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 size={12} className="mr-1" />
                        Delete
                      </Button>
                    )}
                  </>
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
                <Edit className="h-8 w-8 text-[var(--moonlight-silver)]" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-[var(--glow-ember)] rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">+</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-[var(--moonlight-silver-bright)] mb-2">
              No prompt selected
            </h3>
            <p className="text-[var(--moonlight-silver)]/80 max-w-sm mb-4">
              Go back to the prompt list to select a prompt to edit.
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
