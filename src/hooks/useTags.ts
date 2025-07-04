"use client"

import { useState, useCallback } from "react"
import Prompt from "@/lib/models/prompt"

export function useTags() {
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const loadTags = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/user/prompts")
      if (response.ok) {
        const data = await response.json()
        const tags = await Prompt.findAllTags(data)
        setTags(tags)
      }
    } catch (error) {
      console.error("Error loading tags:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    tags,
    loading,
    loadTags
  }
}
