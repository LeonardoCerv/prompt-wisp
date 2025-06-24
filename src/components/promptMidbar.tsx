'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Dialog from '@/components/ui/dialog'
import NewPromptPage from '@/components/newPrompt'
import { PlusCircle, Copy, Trash2, RotateCcw, BookOpen } from 'lucide-react'
import PromptCard from './promptCard'
import { useRouter } from 'next/navigation'
import { PromptData } from '@/lib/models/prompt'
import { savePrompt, deletePrompt, restorePrompt, copyToClipboard, createNewPrompt } from './pages/prompt/navbar'

interface PromptMidbarProps {
  prompts: PromptData[]
  user: {
    id: string
    username: string
    full_name: string
    avatar_url: string
  }
}

export default function PromptMidbar({
  prompts, user
}: PromptMidbarProps) {
  const router = useRouter()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null)

  const handlePromptSelect = (prompt: PromptData) => {
    setSelectedPrompt(prompt)
    router.push(`/prompt/${prompt.id}`) // Navigate to the edit page
  }

  const isOwner = (prompt: PromptData) => {
    return prompt.user_id === user.id
  }

  return (
    <div className="flex flex-col bg-[var(--blackblack)] p-0 h-screen">
      {/* Fixed Action Buttons - Always visible */}
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
              onClick={() => selectedPrompt && copyToClipboard(selectedPrompt.content, selectedPrompt.title)}
              disabled={!selectedPrompt}
              className="h-10 w-10 p-0 hover:text-[var(--glow-ember)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--glow-ember)]/70"
              title="Copy prompt"
            >
              <Copy size={22} />
            </Button>

            {(selectedPrompt?.is_deleted) ? (
              <Button
                size="sm"
                variant="icon"
                onClick={() => selectedPrompt && restorePrompt(selectedPrompt.id)}
                disabled={!selectedPrompt || !selectedPrompt.is_deleted || !isOwner?.(selectedPrompt)}
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
                    if (!isOwner?.(selectedPrompt)) {
                      savePrompt(selectedPrompt.id)
                    } else {
                      // Otherwise use delete logic
                      deletePrompt(selectedPrompt.id)
                    }
                  }
                }}
                disabled={!selectedPrompt || selectedPrompt.is_deleted || (!isOwner?.(selectedPrompt))}
                className="h-10 w-10 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed text-red-400/70"
                title={selectedPrompt && !isOwner?.(selectedPrompt) ? "Unsave prompt" : "Delete prompt"}
              >
                <Trash2 size={22} />
              </Button>
            )}
          </div>
        </div>

      {/* Filtered Results or Empty State - Show for non-'all' filters */}
      
        <div className="flex-1 overflow-y-auto px-3">
          {(prompts.length === 0) ? (
            <Card className="bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)] text-center py-8">
              <CardContent>
                <BookOpen className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-300 mb-2">No prompts found</h3>
                <Button 
                  onClick={createNewPrompt}
                  size="sm"
                  className="bg-[var(--glow-ember)] hover:bg-[var(--glow-ember)]/90"
                >
                  <PlusCircle size={14} className="mr-2" />
                  Create New Prompt
                </Button>
              </CardContent>
            </Card>
          ) : (
             prompts.map((prompt, index) => {
              const isSelected = selectedPrompt?.id === prompt.id
              const isLast = index === prompts.length - 1
              const isBeforeSelected = index < prompts.length - 1 && 
              prompts[index + 1]?.id === selectedPrompt?.id
              
              return (
                <div key={prompt.id}>
                  <PromptCard 
                    prompt={prompt} 
                    isSelected={isSelected}
                    isLast={isLast}
                    isBeforeSelected={isBeforeSelected}
                    onSelect={() => handlePromptSelect(prompt)}
                  />
                </div>
                )}
          ))}
        </div>

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
