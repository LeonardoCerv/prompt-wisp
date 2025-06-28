"use client"

import { useCallback } from "react"
import { toast } from "sonner"
import { useApp } from "@/contexts/appContext"
import type { CollectionInsert } from "@/lib/models/collection"

export function useCollectionOperations() {
  const { state, actions } = useApp()

  const createCollectionWithPrompts = useCallback(
    async (collectionData: CollectionInsert) => {
      try {
        console.log("Creating collection with prompts:", collectionData)

        const newCollection = await actions.createCollection(collectionData)

        // Automatically switch to the new collection view
        actions.setFilter("collection", { collection: newCollection.id })

        toast.success(`Collection "${newCollection.title}" created successfully`)

        return newCollection
      } catch (error) {
        console.error("Error creating collection:", error)
        toast.error("Failed to create collection")
        throw error
      }
    },
    [actions],
  )

  const getCollectionPrompts = useCallback(
    (collectionId: string) => {
      return state.prompts.filter((prompt) => prompt.collections?.includes(collectionId) && !prompt.deleted)
    },
    [state.prompts],
  )

  return {
    createCollectionWithPrompts,
    getCollectionPrompts,
    collections: state.collections,
    loading: state.loading.collections,
  }
}
