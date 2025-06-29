"use client"

import { useState } from "react"
import { useApp } from "@/contexts/appContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Heart, Bookmark, Edit, Trash2, Eye, Copy, Share } from "lucide-react"
import { toast } from "sonner"
import type { PromptData } from "@/lib/models"

interface PromptPreviewProps {
  prompt: PromptData
  onEdit?: () => void
  onDelete?: () => void
}

export default function PromptPreview({ prompt, onEdit, onDelete }: PromptPreviewProps) {
  const { state, actions, utils } = useApp()
  const { user } = state
  const [isLoading, setIsLoading] = useState(false)

  // Status checks using utility functions
  const isFavorite = utils.isFavoritePrompt(prompt.id)
  const hasAccess = utils.hasAccessToPrompt(prompt.id)
  const canView = utils.canView(prompt, user?.id)
  const isDeleted = utils.isDeleted(prompt)

  // Async status checks - we'll need to handle these differently
  const [isOwner, setIsOwner] = useState<boolean | null>(null)
  const [canEdit, setCanEdit] = useState<boolean | null>(null)
  const [isSaved, setIsSaved] = useState<boolean | null>(null)

  // Load async status on mount
  useState(() => {
    if (user?.id) {
      utils.isOwner(prompt, user.id).then(setIsOwner)
      utils.canEdit(prompt, user.id).then(setCanEdit)
      utils.isSaved(prompt.id, user.id).then(setIsSaved)
    }
  })

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error("Please log in to favorite prompts")
      return
    }

    setIsLoading(true)
    try {
      await actions.toggleFavoritePrompt(prompt.id)
      toast.success(isFavorite ? "Removed from favorites" : "Added to favorites")
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast.error("Failed to update favorite status")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePrompt = async () => {
    if (!user) {
      toast.error("Please log in to save prompts")
      return
    }

    setIsLoading(true)
    try {
      await actions.savePrompt(prompt.id)
      toast.success("Prompt saved to your library")
      // Refresh saved status
      utils.isSaved(prompt.id, user.id).then(setIsSaved)
    } catch (error) {
      console.error("Error saving prompt:", error)
      toast.error("Failed to save prompt")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content)
      toast.success("Prompt copied to clipboard")
    } catch (error) {
      console.error("Error copying prompt:", error)
      toast.error("Failed to copy prompt")
    }
  }

  const handleSharePrompt = async () => {
    try {
      const url = `${window.location.origin}/prompt/${prompt.id}`
      await navigator.clipboard.writeText(url)
      toast.success("Prompt link copied to clipboard")
    } catch (error) {
      console.error("Error sharing prompt:", error)
      toast.error("Failed to copy link")
    }
  }

  if (!canView) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Eye className="h-8 w-8 mx-auto mb-2" />
            <p>You don't have permission to view this prompt.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">{prompt.title}</h2>
            {prompt.description && (
              <p className="text-sm text-muted-foreground mb-3">{utils.truncateText(prompt.description, 150)}</p>
            )}

            {/* Tags */}
            {prompt.tags && prompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {prompt.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Status indicators */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Created {utils.formatDate(prompt.created_at)}</span>
              {prompt.updated_at !== prompt.created_at && <span>• Updated {utils.formatDate(prompt.updated_at)}</span>}
              {isDeleted && <Badge variant="destructive">Deleted</Badge>}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 ml-4">
            {/* Favorite button */}
            {hasAccess && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                disabled={isLoading}
                className={isFavorite ? "text-red-500 hover:text-red-600" : ""}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
              </Button>
            )}

            {/* Save button - only show if not owned and not already saved */}
            {!isOwner && !isSaved && (
              <Button variant="ghost" size="sm" onClick={handleSavePrompt} disabled={isLoading}>
                <Bookmark className="h-4 w-4" />
              </Button>
            )}

            {/* Copy button */}
            <Button variant="ghost" size="sm" onClick={handleCopyPrompt}>
              <Copy className="h-4 w-4" />
            </Button>

            {/* Share button */}
            <Button variant="ghost" size="sm" onClick={handleSharePrompt}>
              <Share className="h-4 w-4" />
            </Button>

            {/* Edit button - only show if user can edit */}
            {canEdit && onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            )}

            {/* Delete button - only show if user is owner */}
            {isOwner && onDelete && (
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Prompt content */}
        <div className="bg-muted/50 rounded-lg p-4">
          <pre className="whitespace-pre-wrap text-sm font-mono">{prompt.content}</pre>
        </div>

        {/* Collections this prompt belongs to */}
        {hasAccess && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Collections</h4>
            <div className="flex flex-wrap gap-1">
              {utils.getPromptCollections(prompt.id).map((collection) => (
                <Badge key={collection.id} variant="outline" className="text-xs">
                  {collection.title}
                </Badge>
              ))}
              {utils.getPromptCollections(prompt.id).length === 0 && (
                <span className="text-xs text-muted-foreground">Not in any collections</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
