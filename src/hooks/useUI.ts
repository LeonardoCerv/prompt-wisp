"use client"

import { useState, useCallback } from "react"
import { type PromptData } from "@/lib/models"

interface UIState {
  collectionsExpanded: boolean
  tagsExpanded: boolean
  selectedPrompt: PromptData | null
}

export function useUI() {
  const [ui, setUI] = useState<UIState>({
    collectionsExpanded: false,
    tagsExpanded: false,
    selectedPrompt: null,
  })

  const setSelectedPrompt = useCallback((prompt: PromptData | null) => {
    setUI(prev => ({ ...prev, selectedPrompt: prompt }))
  }, [])

  const toggleCollectionsExpanded = useCallback(() => {
    setUI(prev => ({ ...prev, collectionsExpanded: !prev.collectionsExpanded }))
  }, [])

  const toggleTagsExpanded = useCallback(() => {
    setUI(prev => ({ ...prev, tagsExpanded: !prev.tagsExpanded }))
  }, [])

  return {
    ui,
    setSelectedPrompt,
    toggleCollectionsExpanded,
    toggleTagsExpanded
  }
}
