"use client"

import type React from "react"
import { createContext, useContext, useReducer, useCallback, useEffect, useMemo } from "react"
import type { PromptData, CollectionData, UserData } from "@/lib/models"

// Types
interface AppState {
  prompts: PromptData[]
  collections: CollectionData[]
  user: UserData | null
  tags: string[]
  loading: {
    prompts: boolean
    collections: boolean
    user: boolean
    tags: boolean
  }
  filters: {
    selectedFilter: string
    selectedCollection?: string
    selectedTags: string[]
  }
  ui: {
    collectionsExpanded: boolean
    tagsExpanded: boolean
    selectedPrompt: PromptData | null
  }
}

type AppAction =
  | { type: "SET_PROMPTS"; payload: PromptData[] }
  | { type: "ADD_PROMPT"; payload: PromptData }
  | { type: "UPDATE_PROMPT"; payload: PromptData }
  | { type: "DELETE_PROMPT"; payload: string }
  | { type: "UPDATE_PROMPTS_COLLECTIONS"; payload: { promptIds: string[]; collectionId: string } }
  | { type: "SET_COLLECTIONS"; payload: CollectionData[] }
  | { type: "ADD_COLLECTION"; payload: CollectionData }
  | { type: "SET_USER"; payload: UserData | null }
  | { type: "SET_TAGS"; payload: string[] }
  | { type: "SET_LOADING"; payload: { key: keyof AppState["loading"]; value: boolean } }
  | { type: "SET_FILTER"; payload: { selectedFilter: string; selectedCollection?: string; selectedTags?: string[] } }
  | { type: "SET_UI"; payload: Partial<AppState["ui"]> }

const initialState: AppState = {
  prompts: [],
  collections: [],
  user: null,
  tags: [],
  loading: {
    prompts: false,
    collections: false,
    user: false,
    tags: false,
  },
  filters: {
    selectedFilter: "home",
    selectedCollection: undefined,
    selectedTags: [],
  },
  ui: {
    collectionsExpanded: false,
    tagsExpanded: false,
    selectedPrompt: null,
  },
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_PROMPTS":
      return { ...state, prompts: action.payload }

    case "ADD_PROMPT":
      return { ...state, prompts: [action.payload, ...state.prompts] }

    case "UPDATE_PROMPT":
      return {
        ...state,
        prompts: state.prompts.map((p) => (p.id === action.payload.id ? action.payload : p)),
      }

    case "DELETE_PROMPT":
      return {
        ...state,
        prompts: state.prompts.map((p) => (p.id === action.payload ? { ...p, deleted: true } : p)),
      }

    case "UPDATE_PROMPTS_COLLECTIONS":
      return {
        ...state,
        prompts: state.prompts.map((prompt) => {
          if (action.payload.promptIds.includes(prompt.id)) {
            const currentCollections = prompt.collections || []
            const updatedCollections = currentCollections.includes(action.payload.collectionId)
              ? currentCollections // Already in collection
              : [...currentCollections, action.payload.collectionId] // Add to collection

            return {
              ...prompt,
              collections: updatedCollections,
            }
          }
          return prompt
        }),
      }

    case "SET_COLLECTIONS":
      return { ...state, collections: action.payload }

    case "ADD_COLLECTION":
      return { ...state, collections: [action.payload, ...state.collections] }

    case "SET_USER":
      return { ...state, user: action.payload }

    case "SET_TAGS":
      return { ...state, tags: action.payload }

    case "SET_LOADING":
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value },
      }

    case "SET_FILTER":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      }

    case "SET_UI":
      return {
        ...state,
        ui: { ...state.ui, ...action.payload },
      }

    default:
      return state
  }
}

interface AppContextType {
  state: AppState
  actions: {
    // Data fetching
    loadPrompts: () => Promise<void>
    loadCollections: () => Promise<void>
    loadUser: () => Promise<void>
    loadTags: () => Promise<void>

    // Prompt operations
    createPrompt: (prompt: any) => Promise<PromptData>
    updatePrompt: (id: string, updates: Partial<PromptData>) => Promise<void>
    deletePrompt: (id: string) => Promise<void>
    restorePrompt: (id: string) => Promise<void>
    toggleFavorite: (id: string) => Promise<void>
    savePrompt: (id: string) => Promise<void>

    // Collection operations
    createCollection: (collection: any) => Promise<CollectionData>

    // UI actions
    setFilter: (filter: string, options?: { collection?: string; tags?: string[] }) => void
    setSelectedPrompt: (prompt: PromptData | null) => void
    toggleCollectionsExpanded: () => void
    toggleTagsExpanded: () => void
  }
  utils: {
    // Prompt status utilities
    isOwner: (prompt: PromptData, userId?: string) => boolean
    isFavorite: (promptId: string) => boolean
    isSaved: (promptId: string) => boolean
    isDeleted: (prompt: PromptData) => boolean
    isCollaborator: (prompt: PromptData, userId?: string) => boolean
    canEdit: (prompt: PromptData, userId?: string) => boolean
    canView: (prompt: PromptData, userId?: string) => boolean

    // Collection utilities
    getCollectionPrompts: (collectionId: string) => PromptData[]
    getPromptCollections: (promptId: string) => CollectionData[]

    // General utilities
    formatDate: (dateString: string) => string
    truncateText: (text: string, maxLength: number) => string
  }
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Data loading functions
  const loadPrompts = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: { key: "prompts", value: true } })
    try {
      const response = await fetch("/api/prompts/user")
      if (response.ok) {
        const data = await response.json()
        dispatch({ type: "SET_PROMPTS", payload: data.prompts || data || [] })
      }
    } catch (error) {
      console.error("Error loading prompts:", error)
    } finally {
      dispatch({ type: "SET_LOADING", payload: { key: "prompts", value: false } })
    }
  }, [])

  const loadCollections = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: { key: "collections", value: true } })
    try {
      const response = await fetch("/api/collections")
      if (response.ok) {
        const data = await response.json()
        dispatch({ type: "SET_COLLECTIONS", payload: data.collections || [] })
      }
    } catch (error) {
      console.error("Error loading collections:", error)
    } finally {
      dispatch({ type: "SET_LOADING", payload: { key: "collections", value: false } })
    }
  }, [])

  const loadUser = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: { key: "user", value: true } })
    try {
      const response = await fetch("/api/user")
      if (response.ok) {
        const data = await response.json()
        dispatch({ type: "SET_USER", payload: data })
      }
    } catch (error) {
      console.error("Error loading user:", error)
      dispatch({ type: "SET_USER", payload: null })
    } finally {
      dispatch({ type: "SET_LOADING", payload: { key: "user", value: false } })
    }
  }, [])

  const loadTags = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: { key: "tags", value: true } })
    try {
      const response = await fetch("/api/prompts/tags")
      if (response.ok) {
        const data = await response.json()
        dispatch({ type: "SET_TAGS", payload: data })
      }
    } catch (error) {
      console.error("Error loading tags:", error)
    } finally {
      dispatch({ type: "SET_LOADING", payload: { key: "tags", value: false } })
    }
  }, [])

  // Prompt operations
  const createPrompt = useCallback(async (promptData: any): Promise<PromptData> => {
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
    dispatch({ type: "ADD_PROMPT", payload: newPrompt })
    return newPrompt
  }, [])

  const updatePrompt = useCallback(async (id: string, updates: Partial<PromptData>) => {
    const response = await fetch(`/api/prompts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      throw new Error("Failed to update prompt")
    }

    const updatedPrompt = await response.json()
    dispatch({ type: "UPDATE_PROMPT", payload: updatedPrompt })
  }, [])

  const deletePrompt = useCallback(async (id: string) => {
    const response = await fetch(`/api/prompts?id=${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete prompt")
    }

    dispatch({ type: "DELETE_PROMPT", payload: id })
  }, [])

  const restorePrompt = useCallback(
    async (id: string) => {
      const response = await fetch("/api/prompts/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId: id }),
      })

      if (!response.ok) {
        throw new Error("Failed to restore prompt")
      }

      // Reload prompts to get updated state
      await loadPrompts()
    },
    [loadPrompts],
  )

  const toggleFavorite = useCallback(
    async (id: string) => {
      try {
        const response = await fetch("/api/prompts/favorite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ promptId: id }),
        })

        if (!response.ok) {
          throw new Error("Failed to toggle favorite")
        }

        const result = await response.json()

        // Update user favorites immediately for instant UI feedback
        if (state.user) {
          const currentFavorites = state.user.favorites || []
          const isFavorited = result.isFavorited ?? !currentFavorites.includes(id)

          const updatedFavorites = isFavorited
            ? [...currentFavorites.filter((fId) => fId !== id), id] // Remove duplicates and add
            : currentFavorites.filter((fId) => fId !== id) // Remove from favorites

          dispatch({
            type: "SET_USER",
            payload: {
              ...state.user,
              favorites: updatedFavorites,
            },
          })
        }
      } catch (error) {
        console.error("Error toggling favorite:", error)
        throw error
      }
    },
    [state.user],
  )

  const savePrompt = useCallback(
    async (id: string) => {
      const response = await fetch("/api/prompts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId: id }),
      })

      if (!response.ok) {
        throw new Error("Failed to save prompt")
      }

      // Reload user data to get updated saved prompts
      await loadUser()
    },
    [loadUser],
  )

  const createCollection = useCallback(async (collectionData: any): Promise<CollectionData> => {
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

    // Add the collection to state
    dispatch({ type: "ADD_COLLECTION", payload: newCollection })

    // Update prompts that were added to this collection
    if (collectionData.prompts && collectionData.prompts.length > 0) {
      dispatch({
        type: "UPDATE_PROMPTS_COLLECTIONS",
        payload: {
          promptIds: collectionData.prompts,
          collectionId: newCollection.id,
        },
      })
    }

    return newCollection
  }, [])

  // UI actions
  const setFilter = useCallback((filter: string, options?: { collection?: string; tags?: string[] }) => {
    dispatch({
      type: "SET_FILTER",
      payload: {
        selectedFilter: filter,
        selectedCollection: options?.collection,
        selectedTags: options?.tags || [],
      },
    })
  }, [])

  const setSelectedPrompt = useCallback((prompt: PromptData | null) => {
    dispatch({ type: "SET_UI", payload: { selectedPrompt: prompt } })
  }, [])

  const toggleCollectionsExpanded = useCallback(() => {
    dispatch({ type: "SET_UI", payload: { collectionsExpanded: !state.ui.collectionsExpanded } })
  }, [state.ui.collectionsExpanded])

  const toggleTagsExpanded = useCallback(() => {
    dispatch({ type: "SET_UI", payload: { tagsExpanded: !state.ui.tagsExpanded } })
  }, [state.ui.tagsExpanded])

  // Load initial data
  useEffect(() => {
    loadPrompts()
    loadCollections()
    loadUser()
    loadTags()
  }, [loadPrompts, loadCollections, loadUser, loadTags])

  // Utility functions
  const utils = useMemo(
    () => ({
      // Prompt status utilities
      isOwner: (prompt: PromptData, userId?: string) => {
        const currentUserId = userId || state.user?.id
        return prompt.user_id === currentUserId
      },

      isFavorite: (promptId: string) => {
        return state.user?.favorites?.includes(promptId) || false
      },

      isSaved: (promptId: string) => {
        return state.user?.bought?.includes(promptId) || false
      },

      isDeleted: (prompt: PromptData) => {
        return prompt.deleted || false
      },

      isCollaborator: (prompt: PromptData, userId?: string) => {
        const currentUserId = userId || state.user?.id
        if (!currentUserId) return false
        return prompt.collaborators?.includes(currentUserId) || false
      },

      canEdit: (prompt: PromptData, userId?: string) => {
        const currentUserId = userId || state.user?.id
        if (!currentUserId) return false

        const isOwner = prompt.user_id === currentUserId
        const isCollaborator = prompt.collaborators?.includes(currentUserId) || false
        const isNotDeleted = !prompt.deleted

        return (isOwner || isCollaborator) && isNotDeleted
      },

      canView: (prompt: PromptData, userId?: string) => {
        const currentUserId = userId || state.user?.id

        // Public prompts can be viewed by anyone
        if (prompt.visibility === "public") return true

        // If no user, can only view public prompts
        if (!currentUserId) return false

        // Owner can always view
        if (prompt.user_id === currentUserId) return true

        // Collaborators can view
        if (prompt.collaborators?.includes(currentUserId)) return true

        // Users who have saved/bought the prompt can view
        if (state.user?.bought?.includes(prompt.id)) return true

        return false
      },

      // Collection utilities
      getCollectionPrompts: (collectionId: string) => {
        return state.prompts.filter((prompt) => prompt.collections?.includes(collectionId) && !prompt.deleted)
      },

      getPromptCollections: (promptId: string) => {
        const prompt = state.prompts.find((p) => p.id === promptId)
        if (!prompt?.collections) return []

        return state.collections.filter((collection) => prompt.collections?.includes(collection.id))
      },

      // General utilities
      formatDate: (dateString: string) => {
        try {
          const date = new Date(dateString)
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        } catch {
          return "Unknown date"
        }
      },

      truncateText: (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text
        return text.substring(0, maxLength) + "..."
      },
    }),
    [state.user, state.prompts, state.collections],
  )

  // Memoize the actions object to prevent infinite re-renders
  const contextActions = useMemo(
    () => ({
      loadPrompts,
      loadCollections,
      loadUser,
      loadTags,
      createPrompt,
      updatePrompt,
      deletePrompt,
      restorePrompt,
      toggleFavorite,
      savePrompt,
      createCollection,
      setFilter,
      setSelectedPrompt,
      toggleCollectionsExpanded,
      toggleTagsExpanded,
    }),
    [
      loadPrompts,
      loadCollections,
      loadUser,
      loadTags,
      createPrompt,
      updatePrompt,
      deletePrompt,
      restorePrompt,
      toggleFavorite,
      savePrompt,
      createCollection,
      setFilter,
      setSelectedPrompt,
      toggleCollectionsExpanded,
      toggleTagsExpanded,
    ],
  )

  const contextValue: AppContextType = useMemo(
    () => ({
      state,
      actions: contextActions,
      utils,
    }),
    [state, contextActions, utils],
  )

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
