"use client"

import { useState, useCallback } from "react"
import UsersPrompts from "@/lib/models/usersPrompts"
import UsersCollections from "@/lib/models/usersCollections"
import CollectionPrompts from "@/lib/models/collectionPrompts"

interface UserRoles {
  prompts: Record<string, "owner" | "buyer" | "collaborator">
  collections: Record<string, "owner" | "buyer" | "collaborator">
}

export function useUserRelationships() {
  const [userPrompts, setUserPrompts] = useState<string[]>([])
  const [userCollections, setUserCollections] = useState<string[]>([])
  const [favoritePrompts, setFavoritePrompts] = useState<string[]>([])
  const [favoriteCollections, setFavoriteCollections] = useState<string[]>([])
  const [promptCollectionMap, setPromptCollectionMap] = useState<Record<string, string[]>>({})
  const [userRoles, setUserRoles] = useState<UserRoles>({ prompts: {}, collections: {} })
  const [loading, setLoading] = useState(false)

  const loadUserRelationships = useCallback(async (userId: string) => {
    if (!userId) return

    setLoading(true)
    try {
      // Load user prompts
      const userPromptsData = await UsersPrompts.getPrompts(userId)
      setUserPrompts(userPromptsData)

      // Load user collections
      const userCollectionsData = await UsersCollections.getCollections(userId)
      setUserCollections(userCollectionsData)

      // Load favorite prompts
      const favoritePromptsData = await UsersPrompts.getFavorites(userId)
      setFavoritePrompts(favoritePromptsData)

      // Load favorite collections
      const favoriteCollectionsData = await UsersCollections.getFavorites(userId)
      setFavoriteCollections(favoriteCollectionsData)

      // Load user roles for prompts and collections
      const promptRoles: Record<string, "owner" | "buyer" | "collaborator"> = {}
      const collectionRoles: Record<string, "owner" | "buyer" | "collaborator"> = {}

      // Get roles for each user prompt
      for (const promptId of userPromptsData) {
        try {
          const role = await UsersPrompts.getUserRole(promptId, userId)
          if (role) promptRoles[promptId] = role
        } catch (error) {
          console.error(`Error loading role for prompt ${promptId}:`, error)
        }
      }

      // Get roles for each user collection
      for (const collectionId of userCollectionsData) {
        try {
          const role = await UsersCollections.getUserRole(collectionId, userId)
          if (role) collectionRoles[collectionId] = role
        } catch (error) {
          console.error(`Error loading role for collection ${collectionId}:`, error)
        }
      }

      setUserRoles({ prompts: promptRoles, collections: collectionRoles })

      // Load prompt-collection relationships
      const promptCollectionMapData: Record<string, string[]> = {}

      // For each user prompt, get its collections
      for (const promptId of userPromptsData) {
        try {
          const collections = await CollectionPrompts.getCollections(promptId)
          promptCollectionMapData[promptId] = collections
        } catch (error) {
          console.error(`Error loading collections for prompt ${promptId}:`, error)
          promptCollectionMapData[promptId] = []
        }
      }

      setPromptCollectionMap(promptCollectionMapData)
    } catch (error) {
      console.error("Error loading user relationships:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleFavoritePrompt = useCallback(
    async (promptId: string, userId: string) => {
      try {
        if (!userId) {
          throw new Error("User not authenticated")
        }

        const isFav = favoritePrompts.includes(promptId)
        await UsersPrompts.updateFavorite(promptId, userId, !isFav)

        // Update local state
        const updatedFavorites = isFav
          ? favoritePrompts.filter((fId) => fId !== promptId)
          : [...favoritePrompts, promptId]

        setFavoritePrompts(updatedFavorites)
      } catch (error) {
        console.error("Error toggling favorite:", error)
        throw error
      }
    },
    [favoritePrompts],
  )

  const toggleFavoriteCollection = useCallback(
    async (collectionId: string, userId: string) => {
      try {
        if (!userId) {
          throw new Error("User not authenticated")
        }

        const isFav = favoriteCollections.includes(collectionId)
        await UsersCollections.updateFavorite(collectionId, userId, !isFav)

        // Update local state
        const updatedFavorites = isFav
          ? favoriteCollections.filter((fId) => fId !== collectionId)
          : [...favoriteCollections, collectionId]

        setFavoriteCollections(updatedFavorites)
      } catch (error) {
        console.error("Error toggling collection favorite:", error)
        throw error
      }
    },
    [favoriteCollections],
  )

  const addPromptToCollection = useCallback(
    async (collectionId: string, promptIds: string[]) => {
      try {
        // Add each prompt to the collection using the intermediary table
        for (const promptId of promptIds) {
          await CollectionPrompts.create({
            collection_id: collectionId,
            prompt_id: promptId,
          })
        }

        // Update local state for prompt-collection mapping
        const updatedPromptCollectionMap = { ...promptCollectionMap }
        promptIds.forEach(promptId => {
          const existingCollections = updatedPromptCollectionMap[promptId] || []
          if (!existingCollections.includes(collectionId)) {
            updatedPromptCollectionMap[promptId] = [...existingCollections, collectionId]
          }
        })
        setPromptCollectionMap(updatedPromptCollectionMap)
      } catch (error) {
        console.error("Error adding prompts to collection:", error)
        throw error
      }
    },
    [promptCollectionMap],
  )

  const removePromptFromCollection = useCallback(
    async (collectionId: string, promptId: string) => {
      try {
        await CollectionPrompts.delete(promptId, collectionId)

        // Update local state for prompt-collection mapping
        const updatedPromptCollectionMap = { ...promptCollectionMap }
        updatedPromptCollectionMap[promptId] = (updatedPromptCollectionMap[promptId] || []).filter((id: string) => id !== collectionId)
        setPromptCollectionMap(updatedPromptCollectionMap)
      } catch (error) {
        console.error("Error removing prompt from collection:", error)
        throw error
      }
    },
    [promptCollectionMap],
  )

  const savePrompt = useCallback(
    async (promptId: string, role?: string) => {
      if (userPrompts.includes(promptId)) {
        // Already has this role, no need to save again
        return
      }
      const response = await fetch("/api/user/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt_id: promptId, user_role: role }),
      })

      if (!response.ok) {
        throw new Error("Failed to save prompt")
      }

      // Update local state
      setUserPrompts(prev => [...prev, promptId])
      if (role) {
        setUserRoles((prev: UserRoles) => ({
          ...prev,
          prompts: { ...prev.prompts, [promptId]: role as "owner" | "buyer" | "collaborator" }
        }))
      }
    },
    [userPrompts],
  )

  return {
    userPrompts,
    userCollections,
    favoritePrompts,
    favoriteCollections,
    promptCollectionMap,
    userRoles,
    loading,
    loadUserRelationships,
    toggleFavoritePrompt,
    toggleFavoriteCollection,
    addPromptToCollection,
    removePromptFromCollection,
    savePrompt
  }
}
