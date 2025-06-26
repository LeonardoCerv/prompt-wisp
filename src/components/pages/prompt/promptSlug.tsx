"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import PromptEdit from "@/components/promptEdit"
import PromptPreview from "@/components/promptPreview"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, FileX } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useApp } from "@/contexts/appContext"
import type { PromptData } from "@/lib/models/prompt"
import { UserData } from "@/lib/models"

export default function PromptSlugPage({ slug, promptData, user }: { slug: string, promptData: PromptData, user: UserData}) {
  const router = useRouter()
  const { state, actions } = useApp()
  const { prompts } = state

  const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [promptFound, setPromptFound] = useState(false)

  // Helper functions using context actions
  const isOwner = (prompt: PromptData) => {
    return prompt.user_id === user.id
  }

  const updatePrompt = async (id: string, updates: Partial<PromptData>) => {
    try {
      await actions.updatePrompt(id, updates)

      // Update local selected prompt
      if (selectedPrompt) {
        setSelectedPrompt({ ...selectedPrompt, ...updates })
      }

      toast.success("Prompt updated successfully")
    } catch (error) {
      console.error("Error updating prompt:", error)
      toast.error("Failed to update prompt")
    }
  }

  const handleToggleFavorite = async (id: string) => {
    try {
      await actions.toggleFavorite(id)
      toast.success("Favorite status updated")
    } catch (error) {
      toast.error("Failed to update favorite status")
    }
  }

  const handleCopyToClipboard = (content: string, title: string) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        toast.success(`"${title}" copied to clipboard`)
      })
      .catch(() => {
        toast.error("Failed to copy to clipboard")
      })
  }

  const handleSavePrompt = async (id: string) => {
    try {
      await actions.savePrompt(id)
      toast.success("Prompt saved")
    } catch (error) {
      toast.error("Failed to save prompt")
    }
  }

  const handleDeletePrompt = async (id: string) => {
    try {
      await actions.deletePrompt(id)
      toast.success("Prompt moved to Recently Deleted")
      // Navigate back to prompts list since this prompt is now deleted
      router.push("/prompt")
    } catch (error) {
      toast.error("Failed to delete prompt")
    }
  }

  const handleRestorePrompt = async (id: string) => {
    try {
      await actions.restorePrompt(id)
      toast.success("Prompt restored")
    } catch (error) {
      toast.error("Failed to restore prompt")
    }
  }

  // Initialize prompt data
  useEffect(() => {
    // If we have server-side data, use it immediately
    if (promptData && !selectedPrompt) {
      setSelectedPrompt(promptData)
      setPromptFound(true)
      setIsLoading(false)
      return
    }

    // Fallback to client-side lookup if no server data
    if (slug && prompts.length > 0 && !selectedPrompt) {
      const prompt = prompts.find((p) => p.id === slug)
      if (prompt) {
        setSelectedPrompt(prompt)
        setPromptFound(true)
      } else {
        setPromptFound(false)
      }
      setIsLoading(false)
    } else if (slug && !state.loading.prompts && prompts.length === 0 && !selectedPrompt) {
      // No prompts loaded and not loading - prompt not found
      setPromptFound(false)
      setIsLoading(false)
    }
  }, [slug, prompts, promptData, user.id, state.loading.prompts, selectedPrompt])

  // Loading skeleton
  if (isLoading || state.loading.prompts) {
    return (
      <div className="flex flex-col bg-[var(--prompts)] h-screen p-6">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-8 bg-[var(--slate-grey)]/30 rounded w-32"></div>
              <div className="h-6 bg-[var(--slate-grey)]/20 rounded w-20"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-9 bg-[var(--slate-grey)]/30 rounded w-20"></div>
              <div className="h-9 bg-[var(--slate-grey)]/30 rounded w-20"></div>
            </div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-4">
            <div className="h-4 bg-[var(--slate-grey)]/20 rounded w-3/4"></div>
            <div className="h-4 bg-[var(--slate-grey)]/20 rounded w-1/2"></div>
            <div className="h-32 bg-[var(--slate-grey)]/20 rounded w-full"></div>
            <div className="h-4 bg-[var(--slate-grey)]/20 rounded w-2/3"></div>
            <div className="h-4 bg-[var(--slate-grey)]/20 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    )
  }

  // Prompt not found
  if (!promptFound) {
    return (
      <div className="flex flex-col bg-[var(--prompts)] h-screen">
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="bg-[var(--black)] border-[var(--moonlight-silver-dim)]/30 max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="h-16 w-16 rounded-lg mx-auto flex items-center justify-center bg-[var(--slate-grey)]/20">
                  <FileX className="h-8 w-8 text-[var(--moonlight-silver)]" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[var(--moonlight-silver-bright)] mb-2">Prompt Not Found</h3>
              <p className="text-[var(--moonlight-silver)]/80 mb-6">
                The prompt you&apos;re looking for doesn&apos;t exist or may have been removed.
              </p>
              <Link href="/prompt">
                <Button
                  size="lg"
                  className="bg-[var(--wisp-blue)] hover:bg-[var(--wisp-blue)]/90 text-white font-semibold gap-2"
                >
                  <Home size={16} />
                  Return to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Render the appropriate component based on user permissions
  // Check if user can edit this prompt:
  // - User must be the owner OR a collaborator
  // - Prompt must NOT be soft deleted
  const canEdit =
    selectedPrompt &&
    (isOwner(selectedPrompt) || (selectedPrompt.collaborators && selectedPrompt.collaborators.includes(user.id))) &&
    !selectedPrompt.deleted

  // Show edit component for users with edit permissions
  if (canEdit) {
    return (
      <PromptEdit
        selectedPrompt={selectedPrompt}
        onToggleFavorite={handleToggleFavorite}
        onCopy={handleCopyToClipboard}
        onSave={handleSavePrompt}
        onDelete={handleDeletePrompt}
        onRestore={handleRestorePrompt}
        onUpdatePrompt={updatePrompt}
        isOwner={isOwner}
        currentFilter={state.filters.selectedFilter}
      />
    )
  }

  // Show preview component for read-only access:
  // - Non-owners/non-collaborators
  // - Owners viewing soft-deleted prompts
  // - Any user viewing public/shared prompts
  return (
    <PromptPreview
      selectedPrompt={selectedPrompt}
      onToggleFavorite={handleToggleFavorite}
      onCopy={handleCopyToClipboard}
      onSave={handleSavePrompt}
      currentFilter={state.filters.selectedFilter}
      user={user}
    />
  )
}
