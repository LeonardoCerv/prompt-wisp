"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle, Copy, Trash2, RotateCcw, StarIcon, Plus } from "lucide-react"
import { Star } from "lucide-react"
import { useApp } from "@/contexts/appContext"
import { toast } from "sonner"

interface PromptActionsProps {
  onCreatePrompt: () => void
}

export function PromptActions({ onCreatePrompt }: PromptActionsProps) {
  const { state, actions, utils } = useApp()
  const { selectedPrompt } = state.ui
  const { user } = state

  const copyToClipboard = (content: string, title: string) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        toast.success(`"${title}" copied to clipboard`)
      })
      .catch(() => {
        toast.error("Failed to copy to clipboard")
      })
  }

  const handleDelete = async () => {
    if (!selectedPrompt) return

    try {
      if (!utils.isOwner(selectedPrompt)) {
        await actions.savePrompt(selectedPrompt.id)
        toast.success("Prompt unsaved")
      } else {
        await actions.deletePrompt(selectedPrompt.id)
        toast.success("Prompt moved to Recently Deleted")
      }
    } catch (error) {
      toast.error("Failed to delete prompt")
    }
  }

  const handleRestore = async () => {
    if (!selectedPrompt) return

    try {
      await actions.restorePrompt(selectedPrompt.id)
      toast.success("Prompt restored")
    } catch (error) {
      toast.error("Failed to restore prompt")
    }
  }

  const handleToggleFavorite = async (promptId: string) => {
    if (!promptId) return

    try {
      await actions.toggleFavorite(promptId)
      // The context will handle updating the UI automatically
    } catch (error) {
      toast.error("Failed to update favorite status")
    }
  }

  return (
    <div className="sticky top-0 z-10">
      <div className="flex justify-between items-center gap-2 bg-[var(--blackblack)] p-2">

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

        {selectedPrompt?.deleted ? (
          <Button
            size="sm"
            variant="icon"
            onClick={handleRestore}
            disabled={!selectedPrompt || !selectedPrompt.deleted || !utils.isOwner(selectedPrompt)}
            className="h-10 w-10 hover:text-green-400 disabled:opacity-30 disabled:cursor-not-allowed text-green-400/70"
            title="Restore prompt"
          >
            <RotateCcw size={22} />
          </Button>
        ) : (
          <Button
            size="sm"
            variant="icon"
            onClick={handleDelete}
            disabled={!selectedPrompt || selectedPrompt.deleted || !utils.isOwner(selectedPrompt)}
            className="h-10 w-10 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed text-red-400/70"
            title={selectedPrompt && !utils.isOwner(selectedPrompt) ? "Unsave prompt" : "Delete prompt"}
          >
            <Trash2 size={22} />
          </Button>
        )}
      </div>
    </div>
  )
}
