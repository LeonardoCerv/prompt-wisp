"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Heart,
  Copy,
  Save,
  Trash2,
  RotateCcw,
  Plus,
  X,
  Lock,
  Globe,
  Users,
  Calendar,
  Tag,
  FileText,
  ImageIcon,
} from "lucide-react"
import { toast } from "sonner"
import { useApp } from "@/contexts/appContext"
import type { PromptData } from "@/lib/models/prompt"

interface PromptEditProps {
  selectedPrompt: PromptData
}

export default function PromptEdit({
  selectedPrompt
}: PromptEditProps) {
  const { state, utils, actions } = useApp()
  const { user } = state

  // Local state for editing
  const [title, setTitle] = useState(selectedPrompt.title)
  const [description, setDescription] = useState(selectedPrompt.description || "")
  const [content, setContent] = useState(selectedPrompt.content)
  const [tags, setTags] = useState<string[]>(selectedPrompt.tags || [])
  const [newTag, setNewTag] = useState("")
  const [visibility, setVisibility] = useState<"private" | "public" | "unlisted">(
    (selectedPrompt.visibility as "private" | "public" | "unlisted") || "private"
  )
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Permission states
  const [isOwner, setIsOwner] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [permissionsLoading, setPermissionsLoading] = useState(true)

  // Check permissions on mount and when prompt changes
  useEffect(() => {
    const checkPermissions = async () => {
      if (!user?.id || !selectedPrompt) {
        setPermissionsLoading(false)
        return
      }

      try {
        setPermissionsLoading(true)

        const [ownerCheck, editCheck, accessCheck] = await Promise.all([
          utils.isOwner(selectedPrompt, user.id),
          utils.canEdit(selectedPrompt, user.id),
          utils.isOwner(selectedPrompt, user.id),
        ])

        setIsOwner(ownerCheck)
        setCanEdit(editCheck)
        setHasAccess(accessCheck)

        // Check if favorited
        const favoriteCheck = utils.isFavorite(selectedPrompt.id)
        setIsFavorite(favoriteCheck)
      } catch (error) {
        console.error("Error checking permissions:", error)
        setIsOwner(false)
        setCanEdit(false)
        setHasAccess(false)
        setIsFavorite(false)
      } finally {
        setPermissionsLoading(false)
      }
    }

    checkPermissions()
  }, [selectedPrompt, user?.id, utils])

  // Track changes
  useEffect(() => {
    const hasChanges =
      title !== selectedPrompt.title ||
      description !== (selectedPrompt.description || "") ||
      content !== selectedPrompt.content ||
      JSON.stringify(tags) !== JSON.stringify(selectedPrompt.tags || []) ||
      visibility !== (selectedPrompt.visibility || "private")

    setHasUnsavedChanges(hasChanges)
  }, [title, description, content, tags, visibility, selectedPrompt])

  // Reset form when prompt changes
  useEffect(() => {
    setTitle(selectedPrompt.title)
    setDescription(selectedPrompt.description || "")
    setContent(selectedPrompt.content)
    setTags(selectedPrompt.tags || [])
    setVisibility(selectedPrompt.visibility || "private")
    setHasUnsavedChanges(false)
  }, [selectedPrompt])

  // --- Handlers using appContext ---
  const handleToggleFavorite = async () => {
    try {
      await actions.toggleFavoritePrompt(selectedPrompt.id)
      setIsFavorite(utils.isFavorite(selectedPrompt.id))
      toast.success(isFavorite ? "Removed from favorites" : "Added to favorites")
    } catch (error) {
      toast.error("Failed to update favorite status")
      console.error("Error toggling favorite:", error)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedPrompt.content)
      toast.success(`"${selectedPrompt.title}" copied to clipboard`)
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const handleSave = async () => {
    if (!hasUnsavedChanges) return
    try {
      const updates: Partial<PromptData> = {
        title: title.trim(),
        description: description.trim() || null,
        content: content.trim(),
        tags: tags.filter((tag) => tag.trim()),
        visibility,
        updated_at: new Date().toISOString(),
      }
      await actions.savePromptChanges(selectedPrompt.id, updates)
      setHasUnsavedChanges(false)
      toast.success("Prompt updated successfully")
    } catch (error) {
      console.error("Error saving prompt:", error)
      toast.error("Failed to save prompt")
    }
  }

  const handleSavePrompt = async () => {
    try {
      await actions.savePrompt(selectedPrompt.id)
      toast.success("Prompt saved to your library")
    } catch (error) {
      toast.error("Failed to save prompt")
    }
  }

  const handleDelete = async () => {
    try {
      await actions.deletePrompt(selectedPrompt.id)
      toast.success("Prompt moved to Recently Deleted")
    } catch (error) {
      toast.error("Failed to delete prompt")
    }
  }

  const handleRestore = async () => {
    try {
      await actions.restorePrompt(selectedPrompt.id)
      toast.success("Prompt restored")
    } catch (error) {
      toast.error("Failed to restore prompt")
    }
  }

  // Tag helpers
  const handleAddTag = () => {
    const trimmedTag = newTag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  // Visibility helpers
  const getVisibilityIcon = () => {
    switch (visibility) {
      case "public":
        return <Globe size={16} />
      case "unlisted":
        return <Users size={16} />
      default:
        return <Lock size={16} />
    }
  }

  const getVisibilityLabel = () => {
    switch (visibility) {
      case "public":
        return "Public"
      case "unlisted":
        return "Unlisted"
      default:
        return "Private"
    }
  }

  // Show loading state while checking permissions
  if (permissionsLoading) {
    return (
      <div className="flex flex-col bg-[var(--prompts)] h-screen p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[var(--slate-grey)]/30 rounded w-48 mb-4"></div>
          <div className="h-32 bg-[var(--slate-grey)]/20 rounded w-full mb-4"></div>
          <div className="h-4 bg-[var(--slate-grey)]/20 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  // Show access denied if user doesn't have access
  if (!hasAccess) {
    return (
      <div className="flex flex-col bg-[var(--prompts)] h-screen">
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="bg-[var(--black)] border-[var(--moonlight-silver-dim)]/30 max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="h-16 w-16 rounded-lg mx-auto flex items-center justify-center bg-[var(--slate-grey)]/20">
                  <Lock className="h-8 w-8 text-[var(--moonlight-silver)]" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[var(--moonlight-silver-bright)] mb-2">Access Denied</h3>
              <p className="text-[var(--moonlight-silver)]/80 mb-6">
                You don&apos;t have permission to view or edit this prompt.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-[var(--prompts)] h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[var(--moonlight-silver-dim)]/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[var(--moonlight-silver)]" />
            <h1 className="text-xl font-semibold text-[var(--moonlight-silver-bright)]">
              {selectedPrompt.deleted ? "Deleted Prompt" : "Edit Prompt"}
            </h1>
          </div>
          {selectedPrompt.deleted && (
            <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
              Deleted
            </Badge>
          )}
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              Unsaved Changes
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            className="text-[var(--moonlight-silver)] hover:text-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/10"
          >
            <Heart size={16} className={isFavorite ? "fill-current text-red-500" : ""} />
          </Button>

          {/* Copy Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-[var(--moonlight-silver)] hover:text-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/10"
          >
            <Copy size={16} />
          </Button>

          {/* Save Button (only for non-owners) */}
          {!isOwner && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSavePrompt}
              className="text-[var(--moonlight-silver)] hover:text-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/10"
            >
              <Save size={16} />
            </Button>
          )}

          {/* Owner Actions */}
          {isOwner && (
            <>
              {selectedPrompt.deleted ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRestore}
                  className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                >
                  <RotateCcw size={16} />
                </Button>
              ) : (
                <>
                  {/* Save Changes Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    disabled={!hasUnsavedChanges}
                    className="text-[var(--wisp-blue)] hover:text-[var(--wisp-blue)]/80 hover:bg-[var(--wisp-blue)]/10 disabled:opacity-50"
                  >
                    <Save size={16} />
                    Save
                  </Button>

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[var(--moonlight-silver)] font-medium">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!canEdit || selectedPrompt.deleted}
              className="bg-[var(--black)] border-[var(--moonlight-silver-dim)]/30 text-[var(--moonlight-silver-bright)] focus:border-[var(--wisp-blue)] disabled:opacity-50"
              placeholder="Enter prompt title..."
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[var(--moonlight-silver)] font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!canEdit || selectedPrompt.deleted}
              className="bg-[var(--black)] border-[var(--moonlight-silver-dim)]/30 text-[var(--moonlight-silver-bright)] focus:border-[var(--wisp-blue)] disabled:opacity-50 min-h-[100px]"
              placeholder="Enter prompt description..."
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-[var(--moonlight-silver)] font-medium">
              Content
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={!canEdit || selectedPrompt.deleted}
              className="bg-[var(--black)] border-[var(--moonlight-silver-dim)]/30 text-[var(--moonlight-silver-bright)] focus:border-[var(--wisp-blue)] disabled:opacity-50 min-h-[300px] font-mono text-sm"
              placeholder="Enter your prompt content..."
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-[var(--moonlight-silver)] font-medium flex items-center gap-2">
              <Tag size={16} />
              Tags
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-[var(--wisp-blue)]/20 text-[var(--wisp-blue)] border-[var(--wisp-blue)]/30 flex items-center gap-1"
                >
                  {tag}
                  {canEdit && !selectedPrompt.deleted && (
                    <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-red-400 transition-colors">
                      <X size={12} />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {canEdit && !selectedPrompt.deleted && (
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-[var(--black)] border-[var(--moonlight-silver-dim)]/30 text-[var(--moonlight-silver-bright)] focus:border-[var(--wisp-blue)]"
                  placeholder="Add a tag..."
                />
                <Button
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                  className="bg-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/90 text-white disabled:opacity-50"
                >
                  <Plus size={16} />
                </Button>
              </div>
            )}
          </div>

          {/* Visibility */}
          {isOwner && !selectedPrompt.deleted && (
            <div className="space-y-2">
              <Label className="text-[var(--moonlight-silver)] font-medium flex items-center gap-2">
                {getVisibilityIcon()}
                Visibility
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="private"
                    checked={visibility === "private"}
                    onCheckedChange={() => setVisibility("private")}
                    className="border-[var(--moonlight-silver-dim)]/30"
                  />
                  <Label htmlFor="private" className="text-[var(--moonlight-silver)] flex items-center gap-2">
                    <Lock size={14} />
                    Private - Only you can see this prompt
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="unlisted"
                    checked={visibility === "unlisted"}
                    onCheckedChange={() => setVisibility("unlisted")}
                    className="border-[var(--moonlight-silver-dim)]/30"
                  />
                  <Label htmlFor="unlisted" className="text-[var(--moonlight-silver)] flex items-center gap-2">
                    <Users size={14} />
                    Unlisted - Anyone with the link can see this prompt
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="public"
                    checked={visibility === "public"}
                    onCheckedChange={() => setVisibility("public")}
                    className="border-[var(--moonlight-silver-dim)]/30"
                  />
                  <Label htmlFor="public" className="text-[var(--moonlight-silver)] flex items-center gap-2">
                    <Globe size={14} />
                    Public - Anyone can discover and see this prompt
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <Card className="bg-[var(--black)] border-[var(--moonlight-silver-dim)]/30">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-[var(--moonlight-silver)]">
                  <Calendar size={14} />
                  <span>Created: {new Date(selectedPrompt.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--moonlight-silver)]">
                  <Calendar size={14} />
                  <span>Updated: {new Date(selectedPrompt.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--moonlight-silver)]">
                  {getVisibilityIcon()}
                  <span>Visibility: {getVisibilityLabel()}</span>
                </div>
                {selectedPrompt.images && selectedPrompt.images.length > 0 && (
                  <div className="flex items-center gap-2 text-[var(--moonlight-silver)]">
                    <ImageIcon size={14} />
                    <span>Images: {selectedPrompt.images.length}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
