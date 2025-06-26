"use client"

import { useMemo } from "react"
import type { PromptData, UserData } from "@/lib/models"

interface UseFilteredPromptsProps {
  prompts: PromptData[]
  user: UserData | null
  selectedFilter: string
  selectedCollection?: string
  selectedTags: string[]
}

export function useFilteredPrompts({
  prompts,
  user,
  selectedFilter,
  selectedCollection,
  selectedTags,
}: UseFilteredPromptsProps) {
  return useMemo(() => {
    console.log("Filtering prompts:", {
      selectedFilter,
      selectedCollection,
      totalPrompts: prompts.length,
      promptsWithCollections: prompts.filter((p) => p.collections && p.collections.length > 0).length,
    })

    if (selectedFilter === "home") {
      return []
    }

    let filtered: PromptData[] = []

    switch (selectedFilter) {
      case "favorites":
        if (!user?.favorites || user.favorites.length === 0) return []
        filtered = prompts.filter((prompt) => user.favorites?.includes(prompt.id))
        break

      case "deleted":
        filtered = prompts.filter((prompt) => prompt.deleted)
        break

      case "all":
        filtered = prompts.filter((prompt) => !prompt.deleted)
        break

      case "your":
        if (!user) return []
        filtered = prompts.filter((prompt) => prompt.user_id === user.id && !prompt.deleted)
        break

      case "saved":
        if (!user?.bought || user.bought.length === 0) return []
        filtered = prompts.filter(
          (prompt) => user.bought?.includes(prompt.id) && prompt.user_id !== user?.id && !prompt.deleted,
        )
        break

      case "collection":
        if (!selectedCollection) {
          console.log("No collection selected")
          return []
        }

        filtered = prompts.filter((prompt) => {
          const hasCollection = prompt.collections?.includes(selectedCollection) && !prompt.deleted
          if (hasCollection) {
            console.log("Prompt in collection:", prompt.title, prompt.collections)
          }
          return hasCollection
        })

        console.log("Collection filter result:", {
          selectedCollection,
          filteredCount: filtered.length,
          filteredTitles: filtered.map((p) => p.title),
        })
        break

      case "tags":
        if (selectedTags.length === 0) return []
        filtered = prompts.filter((prompt) => prompt.tags.some((tag) => selectedTags.includes(tag)) && !prompt.deleted)
        break

      default:
        filtered = []
    }

    return filtered
  }, [prompts, user, selectedFilter, selectedCollection, selectedTags])
}
