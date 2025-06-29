"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Star, Copy, Save, Edit, Trash2, RotateCcw, Hash, Clock, Folder, Share } from "lucide-react"
import Link from "next/link"

import type { PromptData } from "@/lib/models/prompt"
import { useApp } from "@/contexts/appContext"
import { toast } from "sonner"

interface PromptEditProps {
  selectedPrompt: PromptData | null
  onToggleFavorite: (id: string) => void
  onCopy: (content: string, title: string) => void
  onSave: (id: string) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
  isOwner: (prompt: PromptData) => boolean
  onUpdatePrompt?: (id: string, updates: Partial<PromptData>) => void
  currentFilter?: string
}

export default function PromptEdit({
  selectedPrompt,
  onToggleFavorite,
  onCopy,
  onSave,
  onDelete,
  onRestore,
  currentFilter,
}: PromptEditProps) {
  const [editedTitle, setEditedTitle] = useState("")
  const [editedContent, setEditedContent] = useState("")
  const [editedDescription, setEditedDescription] = useState("")
  const [editedTags, setEditedTags] = useState<string[]>([])

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  const { utils, actions } = useApp()

  // Update local state when selectedPrompt changes
  useEffect(() => {
    if (selectedPrompt) {
      setEditedTitle(selectedPrompt.title)
      setEditedContent(selectedPrompt.content)
      setEditedDescription(selectedPrompt.description || "")
      setEditedTags(selectedPrompt.tags || [])
      setHasUnsavedChanges(false)
    }
  }, [selectedPrompt])

  // Track unsaved changes
  useEffect(() => {
    if (!selectedPrompt) return

    const hasChanges =
      editedTitle !== selectedPrompt.title ||
      editedContent !== selectedPrompt.content ||
      editedDescription !== (selectedPrompt.description || "") ||
      JSON.stringify(editedTags) !== JSON.stringify(selectedPrompt.tags || [])

    setHasUnsavedChanges(hasChanges)
  }, [selectedPrompt, editedTitle, editedContent, editedDescription, editedTags])

  // Auto-resize textareas
  const autoResizeTextarea = (element: HTMLTextAreaElement) => {
    element.style.height = "auto"
    element.style.height = element.scrollHeight + "px"
  }

  // Handle saving changes
  const handleSaveChanges = useCallback(async () => {
    if (!selectedPrompt || !hasUnsavedChanges) return

    try {
      await actions.savePromptChanges(selectedPrompt.id, {
        title: editedTitle,
        content: editedContent,
        description: editedDescription,
        tags: editedTags,
      })

      toast.success("Prompt updated successfully")
    } catch (error) {
      console.error("Error updating prompt:", error)
      toast.error("Failed to update prompt")
    }
  }, [selectedPrompt, hasUnsavedChanges, actions, editedTitle, editedContent, editedDescription, editedTags])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedPrompt || !utils.isOwner(selectedPrompt)) return

      // Cmd/Ctrl + S to save
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault()
        handleSaveChanges()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedPrompt, handleSaveChanges, utils])

  // Auto-focus title on mount
  useEffect(() => {
    if (selectedPrompt && titleRef.current) {
      titleRef.current.focus()
    }
  }, [selectedPrompt])

  // Handle tag editing
  const handleTagEdit = (value: string) => {
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
    setEditedTags(tags)
  }

  // Generate directory path based on how the prompt was accessed
  const getDirectoryPath = () => {
    if (!selectedPrompt) return ""

    const filterMap: Record<string, string> = {
      "all-prompts": "All Prompts",
      favorites: "Favorites",
      "your-prompts": "Your Prompts",
      saved: "Saved",
      deleted: "Deleted",
    }

    // Determine the primary category based on prompt properties
    let category = "All Prompts"

    if (currentFilter && currentFilter !== "all" && filterMap[currentFilter]) {
      category = filterMap[currentFilter]
    } else {
      // Fallback logic based on prompt properties
      if (selectedPrompt.deleted) {
        category = "Deleted"
      } else if (selectedPrompt && !utils.isOwner(selectedPrompt)) {
        category = "Saved"
      } else if (utils.isFavoritePrompt(selectedPrompt.id)) {
        category = "Favorites"
      } else if (utils.isOwner(selectedPrompt)) {
        category = "Your Prompts"
      }
    }

    return `${category}/${editedTitle || selectedPrompt.title || "Untitled"}`
  }

  const handleContentChange = () => {
    if (
      editedTitle !== selectedPrompt?.title ||
      editedContent !== selectedPrompt?.content ||
      editedDescription !== (selectedPrompt?.description || "") ||
      JSON.stringify(editedTags) !== JSON.stringify(selectedPrompt?.tags || [])
    ) {
      setHasUnsavedChanges(true)
    }
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
              <span className="text-xs text-[var(--moonlight-silver)] flex items-center gap-1">
                <Clock size={12} />
                {new Date(selectedPrompt.updated_at).toLocaleDateString()}
              </span>

              {hasUnsavedChanges && (
                <Button
                  size="sm"
                  onClick={handleSaveChanges}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-1.5"
                >
                  <Save size={16} />
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                onClick={() => onToggleFavorite(selectedPrompt.id)}
                className={`p-1.5 ${
                  utils.isFavoritePrompt(selectedPrompt.id)
                    ? "text-[var(--glow-ember)] hover:text-[var(--glow-ember)]/80"
                    : "text-[var(--moonlight-silver)] hover:text-[var(--moonlight-silver-bright)]"
                }`}
              >
                <Star size={16} className={utils.isFavoritePrompt(selectedPrompt.id) ? "fill-current" : ""} />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  // Share functionality - copy link to clipboard
                  const shareUrl = `${window.location.origin}/prompt/${selectedPrompt.id}`
                  navigator.clipboard.writeText(shareUrl)
                  toast.success("Link copied to clipboard")
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

              {utils.isOwner(selectedPrompt) &&
                (selectedPrompt.deleted ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRestore(selectedPrompt.id)}
                    className="p-1.5 text-green-400 hover:text-green-300"
                  >
                    <RotateCcw size={16} />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(selectedPrompt.id)}
                    className="p-1.5 text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </Button>
                ))}
            </div>
          </div>

          {/* Content - Always in edit mode */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--moonlight-silver)]/80 uppercase tracking-wide">
                Title
              </label>
              <textarea
                ref={titleRef}
                value={editedTitle}
                onChange={(e) => {
                  handleContentChange()
                  setEditedTitle(e.target.value)
                  autoResizeTextarea(e.target)
                }}
                className="w-full text-3xl font-bold text-white bg-transparent border-none outline-none resize-none placeholder-[var(--moonlight-silver)]/50 leading-tight"
                placeholder="Enter prompt title..."
                style={{ minHeight: "50px" }}
                rows={1}
              />
            </div>

            {/* Description */}
            <div className="space-y-2 border-l-2 border-[var(--moonlight-silver-dim)]/30 pl-4">
              <label className="text-xs font-medium text-[var(--moonlight-silver)]/80 uppercase tracking-wide">
                Description
              </label>
              <textarea
                value={editedDescription}
                onChange={(e) => {
                  handleContentChange()
                  setEditedDescription(e.target.value)
                }}
                className="w-full text-base text-[var(--moonlight-silver-bright)] bg-transparent border-none outline-none resize-none placeholder-[var(--moonlight-silver)]/50 leading-relaxed"
                placeholder="Describe what this prompt does..."
                rows={3}
              />
            </div>

            {/* Main Content */}
            <div className="space-y-2 bg-[var(--moonlight-silver-dim)]/5 rounded-lg p-4 border border-[var(--moonlight-silver-dim)]/20">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[var(--moonlight-silver)]/80 uppercase tracking-wide">
                  Prompt Content
                </label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onCopy(editedContent, editedTitle)}
                  className="p-1.5 text-[var(--moonlight-silver)] hover:text-[var(--moonlight-silver-bright)]"
                >
                  <Copy size={14} />
                </Button>
              </div>
              <textarea
                ref={contentRef}
                value={editedContent}
                onChange={(e) => {
                  handleContentChange()
                  setEditedContent(e.target.value)
                  autoResizeTextarea(e.target)
                }}
                className="w-full text-[var(--moonlight-silver-bright)] bg-transparent border-none outline-none resize-none leading-relaxed placeholder-[var(--moonlight-silver)]/50 font-mono"
                placeholder="Write your prompt here..."
                style={{ minHeight: "300px" }}
              />
            </div>

            {/* Tags */}
            <div className="border-t border-[var(--moonlight-silver-dim)]/30 pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Hash size={14} className="text-[var(--moonlight-silver)]" />
                  <label className="text-xs font-medium text-[var(--moonlight-silver)]/80 uppercase tracking-wide">
                    Tags
                  </label>
                </div>
                <input
                  type="text"
                  value={editedTags.join(", ")}
                  onChange={(e) => {
                    handleContentChange()
                    handleTagEdit(e.target.value)
                  }}
                  className="w-full text-sm text-[var(--moonlight-silver-bright)] bg-transparent border border-[var(--moonlight-silver-dim)]/50 rounded-md px-3 py-2 outline-none focus:border-[var(--glow-ember)]/50 focus:ring-1 focus:ring-[var(--glow-ember)]/20"
                  placeholder="Add tags separated by commas..."
                />
              </div>
            </div>
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

              {!utils.isOwner(selectedPrompt) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSave(selectedPrompt.id)}
                  className={`text-xs border-[var(--moonlight-silver-dim)] ${
                    utils.hasAccessToPrompt(selectedPrompt.id)
                      ? "text-[var(--glow-ember)] border-[var(--glow-ember)]/50"
                      : "text-[var(--moonlight-silver-bright)] hover:bg-[var(--slate-grey)]"
                  }`}
                >
                  <Save size={12} className="mr-1" />
                  {utils.hasAccessToPrompt(selectedPrompt.id) ? "Saved" : "Save"}
                </Button>
              )}
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
            <h3 className="text-xl font-semibold text-[var(--moonlight-silver-bright)] mb-2">No prompt selected</h3>
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
