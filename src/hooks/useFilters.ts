"use client"

import { useState, useCallback } from "react"

interface FilterState {
  selectedFilter: string
  selectedCollection?: string
  selectedTags: string[]
}

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>({
    selectedFilter: "home",
    selectedCollection: undefined,
    selectedTags: [],
  })

  const setFilter = useCallback((filter: string, options?: { collection?: string; tags?: string[] }) => {
    setFilters({
      selectedFilter: filter,
      selectedCollection: options?.collection,
      selectedTags: options?.tags || [],
    })
  }, [])

  return {
    filters,
    setFilter
  }
}
