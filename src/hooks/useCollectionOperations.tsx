"use client"

import { useCallback } from "react"
import { toast } from "sonner"
import { useApp } from "@/contexts/appContext"
import type { CollectionInsert } from "@/lib/models/collection"

export function useCollectionOperations() {
  const { state, actions, utils } = useApp()

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
      return utils.getCollectionPrompts(collectionId)
    },
    [utils],
  )

  const toggleFavoriteCollection = useCallback(
    async (collectionId: string) => {
      try {
        await actions.toggleFavoriteCollection(collectionId)
        const wasFavorite = utils.isFavoriteCollection(collectionId)
        toast.success(wasFavorite ? "Added to favorites" : "Removed from favorites")
      } catch (error) {
        console.error("Error toggling collection favorite:", error)
        toast.error("Failed to update favorite status")
        throw error
      }
    },
    [actions, utils],
  )

  return {
    createCollectionWithPrompts,
    getCollectionPrompts,
    toggleFavoriteCollection,
    collections: state.collections,
    loading: state.loading.collections,
  }
}
