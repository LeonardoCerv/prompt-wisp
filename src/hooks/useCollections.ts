"use client"

import { useState, useCallback } from "react"
import { type CollectionData, type CollectionInsert, type CollectionUpdate, Collection } from "@/lib/models"

export function useCollections() {
  const [collections, setCollections] = useState<CollectionData[]>([])
  const [loading, setLoading] = useState(false)

  const loadCollections = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/user/collections")
      if (response.ok) {
        const data = await response.json()
        const collectionsRaw = data.collection || data || []
        const collections: CollectionData[] = []
        
        for (const collection of collectionsRaw) {
          if (typeof collection === "string") {
            const fullCollection = await Collection.findById(collection)
            if (fullCollection) collections.push(fullCollection)
          } else {
            collections.push(collection)
          }
        }

        // Sort non-deleted first
        const sortedCollections = [
          ...collections
            .filter((c) => !c.deleted)
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
        ]

        setCollections(sortedCollections)
      }
    } catch (error) {
      console.error("Error loading collections:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const createCollection = useCallback(async (collectionData: CollectionInsert): Promise<CollectionData> => {
    const response = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collectionData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create collection")
    }

    const newCollection = await response.json()
    setCollections(prev => [newCollection, ...prev])
    return newCollection
  }, [])

  const updateCollection = useCallback(async (id: string, updates: Partial<CollectionUpdate>) => {
    const response = await fetch(`/api/collections`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, updates }),
    })

    if (!response.ok) throw new Error("Failed to update collection")

    const updatedCollection = await response.json()
    setCollections(prev => prev.map(c => c.id === updatedCollection.id ? updatedCollection : c))
  }, [])

  const deleteCollection = useCallback(async (id: string) => {
    const response = await fetch(`/api/collections`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })

    if (!response.ok) throw new Error("Failed to delete collection")

    setCollections(prev => prev.map(c => c.id === id ? { ...c, deleted: true } : c))
  }, [])

  return {
    collections,
    loading,
    loadCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    setCollections
  }
}
