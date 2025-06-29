"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useApp } from "../contexts/appContext"
import type { PromptInsert } from "../lib/models/prompt"

export function usePromptOperations() {
  const router = useRouter()
  const { state, actions, utils } = useApp()
  const { user } = state

  const copyToClipboard = useCallback((content: string, title: string) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        toast.success(`"${title}" copied to clipboard`)
      })
      .catch(() => {
        toast.error("Failed to copy to clipboard")
      })
  }, [])

  const savePrompt = useCallback(
    async (id: string) => {
      try {
        await actions.savePrompt(id)
        toast.success("Prompt saved")
      } catch {
        toast.error("Failed to save prompt")
      }
    },
    [actions],
  )

  const deletePrompt = useCallback(
    async (id: string, redirectAfterDelete = false) => {
      try {
        await actions.deletePrompt(id)
        toast.success("Prompt moved to Recently Deleted")
        if (redirectAfterDelete) {
          router.push("/prompt")
        }
      } catch {
        toast.error("Failed to delete prompt")
      }
    },
    [actions, router],
  )

  const restorePrompt = useCallback(
    async (id: string) => {
      try {
        await actions.restorePrompt(id)
        toast.success("Prompt restored")
      } catch {
        toast.error("Failed to restore prompt")
      }
    },
    [actions],
  )

  const updatePrompt = useCallback(
    async (id: string, updates: Record<string, unknown>) => {
      try {
        await actions.updatePrompt(id, updates)
        toast.success("Prompt updated successfully")
      } catch (error) {
        console.error("Error updating prompt:", error)
        toast.error("Failed to update prompt")
      }
    },
    [actions],
  )

  const createPrompt = useCallback(
    async (promptData: PromptInsert) => {
      try {
        const newPrompt = await actions.createPrompt(promptData)
        toast.success("Prompt created successfully")
        router.push(`/prompt/${newPrompt.id}`)
        return newPrompt
      } catch (error) {
        console.error("Error creating prompt:", error)
        toast.error("Failed to create prompt")
        throw error
      }
    },
    [actions, router],
  )

  const isFavorite = useCallback(
    (promptId: string) => {
      return utils.isFavoritePrompt(promptId)
    },
    [utils],
  )

  const toggleFavorite = useCallback(
    async (promptId: string) => {
      try {
        await actions.toggleFavoritePrompt(promptId)
        const wasFavorite = utils.isFavoritePrompt(promptId)
        toast.success(wasFavorite ? "Added to favorites" : "Removed from favorites")
      } catch (error) {
        toast.error("Failed to update favorite status")
        throw error
      }
    },
    [actions, utils],
  )

  return {
    copyToClipboard,
    toggleFavorite,
    savePrompt,
    deletePrompt,
    restorePrompt,
    updatePrompt,
    createPrompt,
    isFavorite,
  }
}
