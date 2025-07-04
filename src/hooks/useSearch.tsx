"use client"

import { useMemo } from "react"
import { type PromptData } from "@/lib/models"

interface UseSearchProps {
  prompts: PromptData[]
  userId?: string
}

export function useSearch({ prompts, userId }: UseSearchProps) {
  const searchPrompts = useMemo(() => {
    return (query: string) => {
      if (!userId) return []

      // Filter prompts user has access to
      const accessiblePrompts = prompts

      const q = query.trim().toLowerCase()
      if (!q) return accessiblePrompts

      if (q.startsWith("#")) {
        const tagQuery = q.slice(1)
        return accessiblePrompts.filter((p) => p.tags && p.tags.some((tag) => tag.toLowerCase().includes(tagQuery)))
      } else {
        return accessiblePrompts.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            (p.description?.toLowerCase().includes(q) ?? false) ||
            (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(q))),
        )
      }
    }
  }, [prompts, userId])

  return {
    searchPrompts
  }
}
