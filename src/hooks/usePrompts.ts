"use client"

import { useState, useCallback } from "react"
import { type PromptData, type PromptInsert } from "@/lib/models"
import Prompt from "@/lib/models/prompt"

export function usePrompts() {
  const [prompts, setPrompts] = useState<PromptData[]>([])
  const [loading, setLoading] = useState(false)

  const loadPrompts = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/user/prompts")
      if (response.ok) {
        const data = await response.json()
        const promptsRaw = data.prompts || data || []
        const prompts: PromptData[] = []
        
        for (const prompt of promptsRaw) {
          if (typeof prompt === "string") {
            const fullPrompt = await Prompt.findById(prompt)
            if (fullPrompt) prompts.push(fullPrompt)
          } else {
            prompts.push(prompt)
          }
        }

        // Sort non-deleted first
        const sortedPrompts = [
          ...prompts
            .filter((p) => !p.deleted)
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
          ...prompts
            .filter((p) => p.deleted)
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
        ]

        setPrompts(sortedPrompts)
      }
    } catch (error) {
      console.error("Error loading prompts:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const createPrompt = useCallback(async (promptData: PromptInsert): Promise<PromptData> => {
    const response = await fetch("/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(promptData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create prompt")
    }

    const newPrompt = await response.json()
    setPrompts(prev => [newPrompt, ...prev])
    return newPrompt
  }, [])

  const updatePrompt = useCallback(async (id: string, updates: Partial<PromptData>) => {
    const response = await fetch(`/api/prompts/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, updates }),
    })

    if (!response.ok) {
      throw new Error("Failed to update prompt")
    }

    const updatedPrompt = await response.json()
    setPrompts(prev => prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p))
  }, [])

  const deletePrompt = useCallback(async (id: string) => {
    const response = await fetch(`/api/prompts`, {
      method: "DELETE",
      body: JSON.stringify({ prompt_id: id }),
    })

    if (!response.ok) {
      throw new Error("Failed to delete prompt")
    }

    setPrompts(prev => prev.map(p => p.id === id ? { ...p, deleted: true } : p))
  }, [])

  const restorePrompt = useCallback(async (id: string) => {
    const response = await fetch("/api/prompts/", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id, updates: { deleted: false } }),
    })

    if (!response.ok) {
      throw new Error("Failed to restore prompt")
    }

    await loadPrompts()
  }, [loadPrompts])

  return {
    prompts,
    loading,
    loadPrompts,
    createPrompt,
    updatePrompt,
    deletePrompt,
    restorePrompt,
    setPrompts
  }
}
