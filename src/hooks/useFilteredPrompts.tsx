"use client"

import { useMemo } from "react"
import { useApp } from "@/contexts/appContext"
import type { PromptData } from "@/lib/models"

export function useFilteredPrompts() {
  const { state, utils } = useApp()
  const { prompts, filters, user } = state
  const { selectedFilter, selectedCollection, selectedTags } = filters

  const filteredPrompts = useMemo(() => {
    if (!user?.id) return []

    let filtered: PromptData[] = []

    switch (selectedFilter) {
      case "home":
        // Show all prompts user has access to
        filtered = utils.getUserPrompts(user.id)
        break

      case "owned":
        // Show prompts owned by user - need to use async function
        filtered = prompts.filter((p) => utils.hasAccessToPrompt(p.id) && !p.deleted)
        // Note: This will need to be handled differently since getUserOwnedPrompts is async
        break

      case "saved":
        // Show prompts saved by user (not owned) - need to use async function
        filtered = prompts.filter((p) => utils.hasAccessToPrompt(p.id) && !p.deleted)
        // Note: This will need to be handled differently since getUserSavedPrompts is async
        break

      case "favorites":
        filtered = utils.getUserFavoritePrompts(user.id)
        break

      case "collection":
        if (selectedCollection) {
          filtered = utils.getCollectionPrompts(selectedCollection)
        } else {
          filtered = []
        }
        break

      case "deleted":
        // Show deleted prompts user has access to
        filtered = prompts.filter((p) => utils.hasAccessToPrompt(p.id) && utils.isDeleted(p))
        break

      default:
        filtered = utils.getUserPrompts(user.id)
        break
    }

    // Apply tag filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter((prompt) => selectedTags.some((tag) => prompt.tags?.includes(tag)))
    }

    return filtered
  }, [prompts, selectedFilter, selectedCollection, selectedTags, user?.id, utils])

  return {
    filteredPrompts,
    totalCount: filteredPrompts.length,
    isLoading: state.loading.prompts || state.loading.relationships,
  }
}
