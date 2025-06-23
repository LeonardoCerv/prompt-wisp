'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Clock, Star, PlusCircle, Copy, Trash2, RotateCcw, Save, BookOpen } from 'lucide-react'
import { type User } from '@supabase/supabase-js'
import { PromptData } from './prompt-list-card'
import PromptListCard from './prompt-list-card'

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
  isOwner
}: PromptMidbarProps) {
  const recentPrompts = prompts
    .filter(p => !p.isDeleted)
    .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
    .slice(0, 3)

  return (
    <div className="space-y-3">
      {/* Fixed Action Buttons - Always visible */}
      {activeFilter !== 'all' && (
        <div className="sticky top-0 z-10 pb-3">
          <div className="flex justify-end items-center gap-2 bg-[var(--black)] p-2">
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

      {/* Welcome Message & Search - Only show for 'all' filter */}
      {activeFilter === 'all' && (
        <Card className="bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)] shadow-lg">
          <CardContent className="py-4 text-center">
            <h2 className="text-lg font-bold text-white mb-1">
              Welcome back, {user.user_metadata?.username || user.email?.split('@')[0] || 'Leo'}!
            </h2>
            <p className="text-[var(--moonlight-silver)] text-sm mb-4">
              Manage and organize your AI prompts
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-sm mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-3 w-3" />
              <Input
                ref={(el) => setSearchInputRef(el)}
                placeholder="Search all prompts..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 text-sm bg-[var(--slate-grey)] border-[var(--moonlight-silver-dim)] text-[var(--moonlight-silver-bright)] placeholder:text-[var(--moonlight-silver)]"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recently Viewed - Only show for 'all' filter */}
      {activeFilter === 'all' && (
        <Card className="bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)] shadow-lg">
          <CardContent className="p-4">
            <h3 className="text-white text-sm flex items-center gap-2 mb-3">
              <Clock size={16} />
              Recently Viewed
            </h3>
            
            {recentPrompts.length > 0 ? (
              <div className="space-y-2">
                {recentPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[var(--slate-grey)] hover:bg-[var(--slate-grey)]/80 cursor-pointer transition-colors"
                    onClick={() => onPromptSelect(prompt)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-[var(--moonlight-silver-bright)] font-medium text-xs">
                          {prompt.title}
                        </h4>
                        {prompt.isFavorite && (
                          <Star className="h-2 w-2 text-[var(--glow-ember)] fill-current" />
                        )}
                      </div>
                      <p className="text-[var(--moonlight-silver)] text-xs line-clamp-1">
                        {prompt.description}
                      </p>
                    </div>
                    <div className="text-xs text-[var(--moonlight-silver-dim)] ml-2">
                      {new Date(prompt.lastUsed).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-[var(--moonlight-silver)] mb-3 text-sm">No recent prompts to show</p>
                <Button 
                  onClick={onCreatePrompt}
                  size="sm"
                  className="bg-[var(--glow-ember)] hover:bg-[var(--glow-ember)]/90"
                >
                  <PlusCircle size={14} className="mr-2" />
                  Create Your First Prompt
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filtered Results or Empty State - Show for non-'all' filters */}
      {activeFilter !== 'all' && (
        <div className="space-y-0">
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
                  <PromptListCard 
                    prompt={prompt} 
                    isSelected={isSelected}
                    isLast={isLast}
                    isBeforeSelected={isBeforeSelected}
                    onSelect={() => onPromptSelect(prompt)}
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
    </div>
  )
}
