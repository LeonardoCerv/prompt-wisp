'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Dialog from '@/components/ui/dialog'
import NewPromptPage from '@/components/newPrompt'
import { Search, Clock, Star, PlusCircle, Copy, Trash2, RotateCcw, Save, BookOpen } from 'lucide-react'
import { type User } from '@supabase/supabase-js'
import { PromptData } from './promptCard'
import PromptCard from './promptCard'
import { useRouter } from 'next/navigation'

interface PromptMidbarProps {
  user: User
  prompts: PromptData[]
  searchTerm: string
  onSearchChange: (value: string) => void
  onPromptSelect: (prompt: PromptData) => void
  onCreatePrompt: () => void
  searchInputRef: HTMLInputElement | null
  setSearchInputRef: (ref: HTMLInputElement | null) => void
  // New props for consolidated functionality
  activeFilter?: string
  filteredPrompts?: PromptData[]
  selectedTags?: string[]
  selectedPrompt?: PromptData | null
  onToggleFavorite?: (id: string) => void
  onCopy?: (content: string, title: string) => void
  onDelete?: (id: string) => void
  onRestore?: (id: string) => void
  onSave?: (id: string) => void
  isOwner?: (prompt: PromptData) => boolean
  createNewPrompt?: (prompt: { title: string; description: string; tags: string; content: string }) => void
}

export default function PromptMidbar({
  user,
  prompts,
  searchTerm,
  onSearchChange,
  onPromptSelect,
  onCreatePrompt,
  searchInputRef,
  setSearchInputRef,
  activeFilter = 'all',
  filteredPrompts = [],
  selectedTags = [],
  selectedPrompt = null,
  onToggleFavorite,
  onCopy,
  onDelete,
  onRestore,
  onSave,
  isOwner,
  createNewPrompt
}: PromptMidbarProps) {
  const router = useRouter()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  
  const recentPrompts = prompts
    .filter(p => !p.isDeleted)
    .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
    .slice(0, 3)

  const handlePromptSelect = (prompt: PromptData) => {
    onPromptSelect(prompt) // Still call the original handler to update state
    router.push(`/prompt/${prompt.id}`) // Navigate to the edit page
  }

  return (
    <div className="flex flex-col bg-[var(--blackblack)] p-0 h-screen">
      {/* Fixed Action Buttons - Always visible */}
      {activeFilter !== 'all' && (
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
              onClick={() => selectedPrompt && onCopy && onCopy(selectedPrompt.content, selectedPrompt.title)}
              disabled={!selectedPrompt}
              className="h-10 w-10 p-0 hover:text-[var(--glow-ember)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--glow-ember)]/70"
              title="Copy prompt"
            >
              <Copy size={22} />
            </Button>

            {activeFilter === 'deleted' ? (
              <Button
                size="sm"
                variant="icon"
                onClick={() => selectedPrompt && onRestore && onRestore(selectedPrompt.id)}
                disabled={!selectedPrompt || !selectedPrompt.isDeleted || !isOwner?.(selectedPrompt)}
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
                    if (selectedPrompt.isSaved && !isOwner?.(selectedPrompt)) {
                      onSave && onSave(selectedPrompt.id)
                    } else {
                      // Otherwise use delete logic
                      onDelete && onDelete(selectedPrompt.id)
                    }
                  }
                }}
                disabled={!selectedPrompt || selectedPrompt.isDeleted || (!isOwner?.(selectedPrompt) && !selectedPrompt.isSaved)}
                className="h-10 w-10 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed text-red-400/70"
                title={selectedPrompt?.isSaved && !isOwner?.(selectedPrompt) ? "Unsave prompt" : "Delete prompt"}
              >
                <Trash2 size={22} />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Filtered Results or Empty State - Show for non-'all' filters */}
      {activeFilter !== 'all' && (
        <div className="flex-1 overflow-y-auto px-3">
          {filteredPrompts.length === 0 ? (
            <Card className="bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)] text-center py-8">
              <CardContent>
                <BookOpen className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-300 mb-2">No prompts found</h3>
                <p className="text-slate-400 mb-3 text-xs">
                  {searchTerm || selectedTags.length > 0 
                    ? 'Try adjusting your search or filters' 
                    : 'Create your first prompt to get started'
                  }
                </p>
                <Button 
                  onClick={onCreatePrompt}
                  size="sm"
                  className="bg-[var(--glow-ember)] hover:bg-[var(--glow-ember)]/90"
                >
                  <PlusCircle size={14} className="mr-2" />
                  Create New Prompt
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredPrompts.map((prompt, index) => {
              const isSelected = selectedPrompt?.id === prompt.id
              const isLast = index === filteredPrompts.length - 1
              const isBeforeSelected = index < filteredPrompts.length - 1 && 
                filteredPrompts[index + 1]?.id === selectedPrompt?.id
              
              return (
                <div key={prompt.id}>
                  <PromptCard 
                    prompt={prompt} 
                    isSelected={isSelected}
                    isLast={isLast}
                    isBeforeSelected={isBeforeSelected}
                    onSelect={() => handlePromptSelect(prompt)}
                    onToggleFavorite={onToggleFavorite || (() => {})}
                    onCopy={onCopy || (() => {})}
                    onDelete={onDelete || (() => {})}
                    onRestore={onRestore || (() => {})}
                    onSave={onSave || (() => {})}
                    isOwner={isOwner ? isOwner(prompt) : false}
                  />
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Create Prompt Dialog */}
      <Dialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        title="Create New Prompt"
        maxWidth="max-w-2xl"
      >
        <NewPromptPage
          onSubmit={(prompt) => {
            if (createNewPrompt) {
              createNewPrompt(prompt)
            }
          }}
          onCancel={() => setShowCreateDialog(false)}
        />
      </Dialog>
    </div>
  )
}
