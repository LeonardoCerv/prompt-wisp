'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Star, 
  Calendar, 
  Eye, 
  Copy,
  Save,
  Edit,
  Trash2,
  RotateCcw
} from 'lucide-react'
import Link from 'next/link'
import { PromptData } from './prompt-list-card'

interface PromptPreviewProps {
  selectedPrompt: PromptData | null
  onToggleFavorite: (id: string) => void
  onCopy: (content: string, title: string) => void
  onSave: (id: string) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
  isOwner: (prompt: PromptData) => boolean
}

export default function PromptPreview({
  selectedPrompt,
  onToggleFavorite,
  onCopy,
  onSave,
  onDelete,
  onRestore,
  isOwner
}: PromptPreviewProps) {
  return (
    <Card className="bg-[var(--deep-charcoal)] border-[var(--moonlight-silver-dim)] shadow-lg sticky top-4">
      {selectedPrompt ? (
        <>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-white text-lg mb-2">
                  {selectedPrompt.title}
                </CardTitle>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-[var(--glow-ember)]/20 text-[var(--glow-ember)] px-2 py-1 rounded-full font-medium">
                    {selectedPrompt.category}
                  </span>
                  {selectedPrompt.isFavorite && (
                    <Star className="h-4 w-4 text-[var(--glow-ember)] fill-current" />
                  )}
                </div>
                <CardDescription className="text-[var(--moonlight-silver)]">
                  {selectedPrompt.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Prompt Content */}
            <div>
              <h4 className="text-sm font-medium text-[var(--moonlight-silver-bright)] mb-2">
                Prompt Content
              </h4>
              <div className="bg-[var(--slate-grey)] p-4 rounded-lg border border-[var(--moonlight-silver-dim)]">
                <p className="text-[var(--moonlight-silver-bright)] text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedPrompt.content}
                </p>
              </div>
            </div>

            {/* Tags */}
            {selectedPrompt.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-[var(--moonlight-silver-bright)] mb-2">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPrompt.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs bg-[var(--glow-ember)]/20 text-[var(--glow-ember)] px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div>
              <h4 className="text-sm font-medium text-[var(--moonlight-silver-bright)] mb-2">
                Statistics
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-[var(--moonlight-silver)]">
                  <Eye size={14} />
                  {selectedPrompt.usage} uses
                </div>
                <div className="flex items-center gap-2 text-[var(--moonlight-silver)]">
                  <Calendar size={14} />
                  {new Date(selectedPrompt.lastUsed).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-[var(--moonlight-silver-bright)]">
                Actions
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  onClick={() => onCopy(selectedPrompt.content, selectedPrompt.title)}
                  className="gap-1 bg-[var(--glow-ember)] hover:bg-[var(--glow-ember)]/90"
                >
                  <Copy size={14} />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onToggleFavorite(selectedPrompt.id)}
                  className={`gap-1 border-[var(--moonlight-silver-dim)] ${
                    selectedPrompt.isFavorite 
                      ? 'text-[var(--glow-ember)] border-[var(--glow-ember)]/50' 
                      : 'text-[var(--moonlight-silver-bright)] hover:bg-[var(--slate-grey)]'
                  }`}
                >
                  <Star size={14} className={selectedPrompt.isFavorite ? 'fill-current' : ''} />
                  {selectedPrompt.isFavorite ? 'Favorited' : 'Favorite'}
                </Button>
              </div>

              {!isOwner(selectedPrompt) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSave(selectedPrompt.id)}
                  className={`w-full gap-1 border-[var(--moonlight-silver-dim)] ${
                    selectedPrompt.isSaved 
                      ? 'text-[var(--glow-ember)] border-[var(--glow-ember)]/50' 
                      : 'text-[var(--moonlight-silver-bright)] hover:bg-[var(--slate-grey)]'
                  }`}
                >
                  <Save size={14} />
                  {selectedPrompt.isSaved ? 'Saved' : 'Save Prompt'}
                </Button>
              )}

              {isOwner(selectedPrompt) && (
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/prompt/${selectedPrompt.id}`}>
                    <Button size="sm" variant="outline" className="w-full gap-1 border-[var(--moonlight-silver-dim)] text-[var(--moonlight-silver-bright)] hover:bg-[var(--slate-grey)]">
                      <Edit size={14} />
                      Edit
                    </Button>
                  </Link>
                  {selectedPrompt.isDeleted ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRestore(selectedPrompt.id)}
                      className="gap-1 border-green-500/50 text-green-400 hover:bg-green-500/10"
                    >
                      <RotateCcw size={14} />
                      Restore
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(selectedPrompt.id)}
                      className="gap-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 size={14} />
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </>
      ) : (
        <CardContent className="text-center py-12">
          <Eye className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Select a prompt</h3>
          <p className="text-slate-400">
            Choose a prompt from the list to preview its content and access options
          </p>
        </CardContent>
      )}
    </Card>
  )
}
