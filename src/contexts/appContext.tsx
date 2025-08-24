"use client"

import type React from "react"
import { createContext, useContext, useReducer, useCallback, useEffect, useMemo } from "react"
import { type PromptData, type PromptInsert, type CollectionData, type CollectionInsert, type CollectionUpdate, Collection } from "@/lib/models"
import Prompt from "@/lib/models/prompt"

import UsersPrompts from "@/lib/models/usersPrompts"
import UsersCollections from "@/lib/models/usersCollections"
import CollectionPrompts from "@/lib/models/collectionPrompts"
import type { User } from "@supabase/supabase-js"

// Types
interface AppState {
  prompts: PromptData[]
  collections: CollectionData[]
  user: User | null
  tags: string[]
  userPrompts: string[]
  userCollections: string[]
  favoritePrompts: string[]
  favoriteCollections: string[]
  promptCollectionMap: Record<string, string[]> 
  userRoles: {
    prompts: Record<string, "owner" | "buyer" | "collaborator"> 
    collections: Record<string, "owner" | "buyer" | "collaborator"> 
  }
  loading: {
    prompts: boolean
    collections: boolean
    user: boolean
    tags: boolean
    relationships: boolean
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
  | { type: "SET_COLLECTIONS"; payload: CollectionData[] }
  | { type: "ADD_COLLECTION"; payload: CollectionData }
  | { type: "UPDATE_COLLECTION"; payload: CollectionData }
  | { type: "DELETE_COLLECTION"; payload: string }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_TAGS"; payload: string[] }
  | { type: "SET_USER_PROMPTS"; payload: string[] }
  | { type: "SET_USER_COLLECTIONS"; payload: string[] }
  | { type: "SET_FAVORITE_PROMPTS"; payload: string[] }
  | { type: "SET_FAVORITE_COLLECTIONS"; payload: string[] }
  | { type: "SET_PROMPT_COLLECTION_MAP"; payload: Record<string, string[]> }
  | {
      type: "SET_USER_ROLES"
      payload: {
        prompts?: Record<string, "owner" | "buyer" | "collaborator">
        collections?: Record<string, "owner" | "buyer" | "collaborator">
      }
    }
  | { type: "SET_LOADING"; payload: { key: keyof AppState["loading"]; value: boolean } }
  | { type: "SET_FILTER"; payload: { selectedFilter: string; selectedCollection?: string; selectedTags?: string[] } }
  | { type: "SET_UI"; payload: Partial<AppState["ui"]> }

const initialState: AppState = {
  prompts: [],
  collections: [],
  user: null,
  tags: [],
  userPrompts: [],
  userCollections: [],
  favoritePrompts: [],
  favoriteCollections: [],
  promptCollectionMap: {},
  userRoles: {
    prompts: {},
    collections: {},
  },
  loading: {
    prompts: false,
    collections: false,
    user: false,
    tags: false,
    relationships: false,
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
      const updatedPromptsAfterDelete = state.prompts.map((p) => (p.id === action.payload ? { ...p, deleted: true } : p))
      const updatedSelectedPromptAfterDelete = state.ui.selectedPrompt?.id === action.payload 
        ? { ...state.ui.selectedPrompt, deleted: true }
        : state.ui.selectedPrompt
      
      return {
        ...state,
        prompts: updatedPromptsAfterDelete,
        ui: { ...state.ui, selectedPrompt: updatedSelectedPromptAfterDelete },
      }

    case "SET_COLLECTIONS":
      return { ...state, collections: action.payload }

    case "ADD_COLLECTION":
      return { ...state, collections: [action.payload, ...state.collections] }

    case "UPDATE_COLLECTION":
      return {
        ...state,
        collections: state.collections.map((c) => (c.id === action.payload.id ? action.payload : c)),
      }

    case "DELETE_COLLECTION":
      return {
        ...state,
        collections: state.collections.map((c) => (c.id === action.payload ? { ...c, deleted: true } : c)),
      }

    case "SET_USER":
      return { ...state, user: action.payload }

    case "SET_TAGS":
      return { ...state, tags: action.payload }

    case "SET_USER_PROMPTS":
      return { ...state, userPrompts: action.payload }

    case "SET_USER_COLLECTIONS":
      return { ...state, userCollections: action.payload }

    case "SET_FAVORITE_PROMPTS":
      return { ...state, favoritePrompts: action.payload }

    case "SET_FAVORITE_COLLECTIONS":
      return { ...state, favoriteCollections: action.payload }

    case "SET_PROMPT_COLLECTION_MAP":
      return { ...state, promptCollectionMap: action.payload }

    case "SET_USER_ROLES":
      return {
        ...state,
        userRoles: {
          prompts: { ...state.userRoles.prompts, ...action.payload.prompts },
          collections: { ...state.userRoles.collections, ...action.payload.collections },
        },
      }

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
    loadUserRelationships: () => Promise<void>

    // Prompt operations
    createPrompt: (prompt: PromptInsert) => Promise<PromptData>
    updatePrompt: (id: string, updates: Partial<PromptData>) => Promise<void>
    deletePrompt: (id: string) => Promise<void>
    restorePrompt: (id: string) => Promise<void>
    toggleFavoritePrompt: (id: string) => Promise<void>
    savePrompt: (id: string, role?: string) => Promise<void>
    savePromptChanges: (id: string, updates: Partial<PromptData>) => Promise<void>

    // Collection operations
    createCollection: (collection: CollectionInsert) => Promise<CollectionData>
    updateCollection: (id: string, updates: Partial<CollectionUpdate>) => Promise<void>
    editCollection: (id: string, updates: Partial<CollectionUpdate>) => Promise<void>
    deleteCollection: (id: string) => Promise<void>
    toggleFavoriteCollection: (id: string) => Promise<void>
    saveCollection: (id: string, role?: string) => Promise<void>
    removeFromCollection: (collectionId: string) => Promise<void>
    addPromptToCollection: (collectionId: string, promptIds: string[]) => Promise<void>
    removePromptFromCollection: (collectionId: string, promptId: string) => Promise<void>

    // User roles
    setUserRoles: (roles: { prompts?: Record<string, "owner" | "buyer" | "collaborator">; collections?: Record<string, "owner" | "buyer" | "collaborator"> }) => void
    setPromptRole: (promptId: string, role: "owner" | "buyer" | "collaborator") => void
    setCollectionRole: (collectionId: string, role: "owner" | "buyer" | "collaborator") => void
    setBatchRoles: (roles: { prompts?: Record<string, "owner" | "buyer" | "collaborator">; collections?: Record<string, "owner" | "buyer" | "collaborator"> }) => void

    // UI actions
    setFilter: (filter: string, options?: { collection?: string; tags?: string[] }) => void
    setSelectedPrompt: (prompt: PromptData | null) => void
    toggleCollectionsExpanded: () => void
    toggleTagsExpanded: () => void
  }
  utils: {
    // Prompt status utilities (now synchronous)
    isOwner: (prompt: PromptData, userId?: string) => boolean
    isFavorite: (promptId: string, userId?: string) => boolean
    isFavoritePrompt: (promptId: string) => boolean
    isFavoriteCollection: (collectionId: string) => boolean
    isSaved: (promptId: string, userId?: string) => boolean
    hasAccessToPrompt: (promptId: string) => boolean
    hasAccessToCollection: (collectionId: string) => boolean
    isDeleted: (item: PromptData | CollectionData) => boolean
    canEdit: (prompt: PromptData, userId?: string) => boolean
    canView: (prompt: PromptData, userId?: string) => boolean

    // Additional role utilities
    hasPromptRole: (promptId: string, role: "owner" | "buyer" | "collaborator") => boolean
    hasCollectionRole: (collectionId: string, role: "owner" | "buyer" | "collaborator") => boolean
    getPromptRole: (promptId: string) => "owner" | "buyer" | "collaborator" | undefined
    getCollectionRole: (collectionId: string) => "owner" | "buyer" | "collaborator" | undefined

    // User relationship utilities
    getUserPrompts: (userId?: string) => PromptData[]
    getUserCollections: (userId?: string) => CollectionData[]
    getUserOwnedPrompts: (userId?: string) => PromptData[]
    getUserFavoritePrompts: (userId?: string) => PromptData[]
    getUserSavedPrompts: (userId?: string) => PromptData[]

    // Collection utilities
    getCollectionPrompts: (collectionId: string) => Promise<PromptData[]>
    getSharedCollectionPrompts: (collectionId: string) => Promise<PromptData[]>
    getPromptCollections: (promptId: string) => CollectionData[]

    // Filtering utilities
    getFilteredPrompts: (filter: string, collection?: string, tags?: string[]) => Promise<PromptData[]>

    // General utilities
    formatDate: (dateString: string) => string
    truncateText: (text: string, maxLength: number) => string
  }
  search: {
    searchPrompts: (query: string) => PromptData[]
  }
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const loadPrompts = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: { key: "prompts", value: true } })
    try {
      const response = await fetch("/api/user/prompts")
      if (response.ok) {
        const data = await response.json()

        const promptsRaw = data.prompts || data || []
        const prompts = await Prompt.findBatchByIds(promptsRaw)
      
        const sortedPrompts = [
          ...prompts
            .filter((p) => !p.deleted)
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
          ...prompts
            .filter((p) => p.deleted)
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
        ]
        dispatch({ type: "SET_PROMPTS", payload: sortedPrompts })
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
      const response = await fetch("/api/user/collections")
      if (response.ok) {
        const data = await response.json()

        const collectionsRaw = data.collection || data || []
        const collections = await Collection.findBatchByIds(collectionsRaw)

        dispatch({ type: "SET_COLLECTIONS", payload: collections})
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
     const response = await fetch("/api/user/prompts")
      if (response.ok) {
        const data = await response.json()

        const tags = await Prompt.findAllTags(data)

        dispatch({ type: "SET_TAGS", payload: tags })
      }
    } catch (error) {
      console.error("Error loading tags:", error)
    } finally {
      dispatch({ type: "SET_LOADING", payload: { key: "tags", value: false } })
    }
  }, [])

  const loadUserRelationships = useCallback(async () => {
    if (!state.user?.id) return

    dispatch({ type: "SET_LOADING", payload: { key: "relationships", value: true } })
    try {
      const [promptRelationships, collectionRelationships] = await Promise.all([
        UsersPrompts.getUserRelationships(state.user.id),
        UsersCollections.getUserRelationships(state.user.id)
      ])

      dispatch({ type: "SET_USER_PROMPTS", payload: promptRelationships.prompts })
      dispatch({ type: "SET_USER_COLLECTIONS", payload: collectionRelationships.collections })
      dispatch({ type: "SET_FAVORITE_PROMPTS", payload: promptRelationships.favorites })
      dispatch({ type: "SET_FAVORITE_COLLECTIONS", payload: collectionRelationships.favorites })
      
      dispatch({ 
        type: "SET_USER_ROLES", 
        payload: { 
          prompts: promptRelationships.roles,
          collections: collectionRelationships.roles
        } 
      })
    } catch (error) {
      console.error("Error loading user relationships:", error)
    } finally {
      dispatch({ type: "SET_LOADING", payload: { key: "relationships", value: false } })
    }
  }, [state.user?.id])

  // Prompt operations
  const createPrompt = useCallback(
    async (promptData: PromptInsert): Promise<PromptData> => {
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

      await loadUserRelationships()

      if (promptData.tags && promptData.tags.length > 0) {
        await loadTags()
      }

      return newPrompt
    },
    [loadUserRelationships, loadTags],
  )

  const updatePrompt = useCallback(async (id: string, updates: Partial<PromptData>) => {
    const response = await fetch(`/api/prompts/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({id, updates}),
    })

    if (!response.ok) {
      throw new Error("Failed to update prompt")
    }

    const updatedPrompt = await response.json()
    dispatch({ type: "UPDATE_PROMPT", payload: updatedPrompt })
    
    if (updates.tags) {
      await loadTags()
    }
  }, [loadTags])

  const deletePrompt = useCallback(async (id: string) => {
    const response = await fetch(`/api/prompts`, {
      method: "DELETE",
      body: JSON.stringify({prompt_id: id}),
    })

    if (!response.ok) {
      throw new Error("Failed to delete prompt")
    }

    dispatch({ type: "DELETE_PROMPT", payload: id })
  }, [])

  const restorePrompt = useCallback(
    async (id: string) => {
      const response = await fetch("/api/prompts/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id, updates: { deleted: false } }),
      })

      if (!response.ok) {
        throw new Error("Failed to restore prompt")
      }

      const updatedPrompt = await response.json()
      
      dispatch({ type: "UPDATE_PROMPT", payload: updatedPrompt })
      
      if (state.ui.selectedPrompt?.id === id) {
        dispatch({ type: "SET_UI", payload: { selectedPrompt: updatedPrompt } })
      }
      
      await loadTags()
    },
    [state.ui.selectedPrompt, loadTags],
  )

  const toggleFavoritePrompt = useCallback(
    async (id: string) => {
      try {
        if (!state.user) {
          throw new Error("User not authenticated")
        }

        const isFav = state.favoritePrompts.includes(id)
        await UsersPrompts.updateFavorite(id, state.user.id, !isFav)

        const updatedFavorites = isFav
          ? state.favoritePrompts.filter((fId) => fId !== id)
          : [...state.favoritePrompts, id]

        dispatch({ type: "SET_FAVORITE_PROMPTS", payload: updatedFavorites })
      } catch (error) {
        console.error("Error toggling favorite:", error)
        throw error
      }
    },
    [state.user, state.favoritePrompts],
  )

  const savePrompt = useCallback(
    async (id: string, role?: string) => {
      if (state.userPrompts.includes(id)) {
        return
      }
      const response = await fetch("/api/user/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt_id: id, user_role: role }),
      })

      if (!response.ok) {
        throw new Error("Failed to save prompt")
      }

      await loadUserRelationships()
    },
    [loadUserRelationships, state.userPrompts],
  )

  const savePromptChanges = useCallback(async (id: string, updates: Partial<PromptData>) => {
    const response = await fetch(`/api/prompts/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, updates }),
    })

    if (!response.ok) {
      throw new Error("Failed to update prompt")
    }

    const updatedPrompt = await response.json()
    dispatch({ type: "UPDATE_PROMPT", payload: updatedPrompt })
    
    if (updates.tags) {
      await loadTags()
    }
  }, [loadTags])

  const saveCollection = useCallback(
    async (id: string, role?: string) => {
      if (state.userCollections.includes(id)) {
        return
      }
      
      try {
        const response = await fetch("/api/user/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collection_id: id, user_role: role }),
        })

        if (!response.ok) {
          throw new Error("Failed to save collection")
        }

        const promptIds = await CollectionPrompts.getPrompts(id)
        
        for (const promptId of promptIds) {
          if (!state.userPrompts.includes(promptId)) {
            try {
              await fetch("/api/user/prompts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt_id: promptId, user_role: "buyer" }),
              })
            } catch (error) {
              console.error(`Error saving prompt ${promptId} to user library:`, error)
            }
          }
        }

        await loadUserRelationships()
      } catch (error) {
        console.error("Error saving collection:", error)
        throw error
      }
    },
    [loadUserRelationships, state.userCollections, state.userPrompts],
  )

  const removeFromCollection = useCallback(
    async (collectionId: string) => {
      try {
        const response = await fetch("/api/user/collections", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collection_id: collectionId }),
        })

        if (!response.ok) {
          throw new Error("Failed to remove collection")
        }

        await loadUserRelationships()
      } catch (error) {
        console.error("Error removing collection:", error)
        throw error
      }
    },
    [loadUserRelationships],
  )

  const createCollection = useCallback(
    async (collectionData: CollectionInsert): Promise<CollectionData> => {
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
      dispatch({ type: "ADD_COLLECTION", payload: newCollection })

      const updatedUserCollections = [...state.userCollections, newCollection.id]
      dispatch({ type: "SET_USER_COLLECTIONS", payload: updatedUserCollections })

      loadUserRelationships()
      return newCollection
    },
    [state.userCollections, loadUserRelationships],
  )

  const updateCollection = useCallback(async (id: string, updates: Partial<CollectionUpdate>) => {
    const response = await fetch(`/api/collections`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, updates }),
    })

    if (!response.ok) throw new Error("Failed to update collection")

    const updatedCollection = await response.json()
    dispatch({ type: "UPDATE_COLLECTION", payload: updatedCollection })
  }, [])

  const deleteCollection = useCallback(async (id: string) => {
    const response = await fetch(`/api/collections`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })

    if (!response.ok) throw new Error("Failed to delete collection")

    dispatch({ type: "DELETE_COLLECTION", payload: id })
    
    const updatedUserCollections = state.userCollections.filter(collectionId => collectionId !== id)
    dispatch({ type: "SET_USER_COLLECTIONS", payload: updatedUserCollections })
  }, [state.userCollections])

  const toggleFavoriteCollection = useCallback(
    async (id: string) => {
      try {
        if (!state.user) {
          throw new Error("User not authenticated")
        }

        const isFav = state.favoriteCollections.includes(id)
        await UsersCollections.updateFavorite(id, state.user.id, !isFav)

        const updatedFavorites = isFav
          ? state.favoriteCollections.filter((fId) => fId !== id)
          : [...state.favoriteCollections, id]

        dispatch({ type: "SET_FAVORITE_COLLECTIONS", payload: updatedFavorites })
      } catch (error) {
        console.error("Error toggling collection favorite:", error)
        throw error
      }
    },
    [state.user, state.favoriteCollections],
  )

  const addPromptToCollection = useCallback(
    async (collectionId: string, promptIds: string[]) => {
      try {
        for (const promptId of promptIds) {
          await CollectionPrompts.create({
            collection_id: collectionId,
            prompt_id: promptId,
          })
        }

        await loadUserRelationships()
      } catch (error) {
        console.error("Error adding prompts to collection:", error)
        throw error
      }
    },
    [loadUserRelationships],
  )

  const removePromptFromCollection = useCallback(
    async (collectionId: string, promptId: string) => {
      try {
        await CollectionPrompts.delete(promptId, collectionId)
        await loadUserRelationships()
      } catch (error) {
        console.error("Error removing prompt from collection:", error)
        throw error
      }
    },
    [loadUserRelationships],
  )

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

  // User roles actions
  const setUserRoles = useCallback((roles: { prompts?: Record<string, "owner" | "buyer" | "collaborator">; collections?: Record<string, "owner" | "buyer" | "collaborator"> }) => {
    dispatch({ type: "SET_USER_ROLES", payload: roles })
  }, [])

  // Utility function to set a single prompt role
  const setPromptRole = useCallback((promptId: string, role: "owner" | "buyer" | "collaborator") => {
    dispatch({ type: "SET_USER_ROLES", payload: { prompts: { [promptId]: role } } })
  }, [])

  // Utility function to set a single collection role
  const setCollectionRole = useCallback((collectionId: string, role: "owner" | "buyer" | "collaborator") => {
    dispatch({ type: "SET_USER_ROLES", payload: { collections: { [collectionId]: role } } })
  }, [])

  // Utility function to set multiple roles at once
  const setBatchRoles = useCallback((roles: { 
      prompts?: Record<string, "owner" | "buyer" | "collaborator">; 
      collections?: Record<string, "owner" | "buyer" | "collaborator"> 
    }) => {
      dispatch({ type: "SET_USER_ROLES", payload: roles })
    }, [])

  // Load initial data and user relationships when user changes
  useEffect(() => {
    loadPrompts()
    loadCollections()
    loadUser()
    loadTags()
  }, [loadPrompts, loadCollections, loadUser, loadTags])

  useEffect(() => {
    if (state.user?.id) {
      loadUserRelationships()
    }
  }, [state.user?.id, loadUserRelationships])

  // Utility functions (now synchronous using cached state)
  const utils = useMemo(
    () => ({
      // Prompt status utilities - now synchronous using cached roles
      isOwner: (prompt: PromptData, userId?: string): boolean => {
        const currentUserId = userId || state.user?.id
        if (!currentUserId) return false
        return state.userRoles.prompts[prompt.id] === "owner"
      },

      isFavorite: (promptId: string, userId?: string): boolean => {
        const currentUserId = userId || state.user?.id
        if (!currentUserId) return false
        return state.favoritePrompts.includes(promptId)
      },

      isFavoritePrompt: (promptId: string): boolean => {
        return state.favoritePrompts.includes(promptId)
      },

      isFavoriteCollection: (collectionId: string): boolean => {
        return state.favoriteCollections.includes(collectionId)
      },

      isSaved: (promptId: string, userId?: string): boolean => {
        const currentUserId = userId || state.user?.id
        if (!currentUserId) return false

        const hasAccess = state.userPrompts.includes(promptId)
        if (!hasAccess) return false

        const role = state.userRoles.prompts[promptId]
        return role !== "owner" && role !== undefined
      },

      hasAccessToPrompt: (promptId: string): boolean => {
        return state.userPrompts.includes(promptId)
      },

      hasAccessToCollection: (collectionId: string): boolean => {
        return state.userCollections.includes(collectionId)
      },

      isDeleted: (item: PromptData | CollectionData): boolean => {
        return item.deleted || false
      },

      canEdit: (prompt: PromptData, userId?: string): boolean => {
        const currentUserId = userId || state.user?.id
        if (!currentUserId) return false
        if (prompt.deleted) return false

        const role = state.userRoles.prompts[prompt.id]
        return role === "owner" || role === "collaborator"
      },

      canView: (prompt: PromptData, userId?: string): boolean => {
        const currentUserId = userId || state.user?.id

        // Public prompts can be viewed by anyone
        if (prompt.visibility === "public") return true

        // If no user, can only view public prompts
        if (!currentUserId) return false

        // Check if user has access to this prompt
        return state.userPrompts.includes(prompt.id)
      },

      // Additional role utilities
      hasPromptRole: (promptId: string, role: "owner" | "buyer" | "collaborator"): boolean => {
        return state.userRoles.prompts[promptId] === role
      },

      hasCollectionRole: (collectionId: string, role: "owner" | "buyer" | "collaborator"): boolean => {
        return state.userRoles.collections[collectionId] === role
      },

      getPromptRole: (promptId: string): "owner" | "buyer" | "collaborator" | undefined => {
        return state.userRoles.prompts[promptId]
      },

      getCollectionRole: (collectionId: string): "owner" | "buyer" | "collaborator" | undefined => {
        return state.userRoles.collections[collectionId]
      },

      getUserPrompts: (userId?: string): PromptData[] => {
        const currentUserId = userId || state.user?.id
        if (!currentUserId) return []
        return state.prompts.filter((p) => state.userPrompts.includes(p.id) && !p.deleted)
      },

      getUserCollections: (userId?: string): CollectionData[] => {
        const currentUserId = userId || state.user?.id
        if (!currentUserId) return []
        return state.collections.filter((c) => state.userCollections.includes(c.id) && !c.deleted)
      },

      getUserOwnedPrompts: (userId?: string): PromptData[] => {
        const currentUserId = userId || state.user?.id
        if (!currentUserId) return []

        return state.prompts.filter((p) => {
          const hasAccess = state.userPrompts.includes(p.id)
          const isOwner = state.userRoles.prompts[p.id] === "owner"
          return hasAccess && isOwner && !p.deleted
        })
      },

      getUserFavoritePrompts: (userId?: string): PromptData[] => {
        const currentUserId = userId || state.user?.id
        if (!currentUserId) return []
        return state.prompts.filter((p) => state.favoritePrompts.includes(p.id) && !p.deleted)
      },

      getUserSavedPrompts: (userId?: string): PromptData[] => {
        const currentUserId = userId || state.user?.id
        if (!currentUserId) return []

        return state.prompts.filter((p) => {
          const hasAccess = state.userPrompts.includes(p.id)
          const role = state.userRoles.prompts[p.id]
          const isSaved = role !== "owner" && role !== undefined
          return hasAccess && isSaved && !p.deleted
        })
      },

      getCollectionPrompts: async (collectionId: string): Promise<PromptData[]> => {
        try {
          const promptIds = await CollectionPrompts.getPrompts(collectionId)
          return state.prompts.filter((prompt) => promptIds.includes(prompt.id) && !prompt.deleted)
        } catch (error) {
          console.error(`Error fetching prompts for collection ${collectionId}:`, error)
          return []
        }
      },

      getSharedCollectionPrompts: async (collectionId: string): Promise<PromptData[]> => {
        try {
          const promptIds = await CollectionPrompts.getPrompts(collectionId)
          return await Prompt.findBatchByIds(promptIds)
        } catch (error) {
          console.error(`Error fetching shared collection prompts for collection ${collectionId}:`, error)
          return []
        }
      },

      getPromptCollections: (promptId: string): CollectionData[] => {
        const collectionIds = state.promptCollectionMap[promptId] || []
        return state.collections.filter((collection) => collectionIds.includes(collection.id) && !collection.deleted)
      },

      getFilteredPrompts: async (filter: string, collection?: string, tags?: string[]): Promise<PromptData[]> => {
        //const userId = state.user?.id
        //if (!userId) return []
        let filtered: PromptData[] = []

        switch (filter) {
          case "home":
            // Show all prompts user has access to
            filtered = state.prompts.filter((p) => !p.deleted)
            break

          case "owned":
            filtered = state.prompts.filter((p) => {
              const hasAccess = state.userPrompts.includes(p.id)
              const isOwner = state.userRoles.prompts[p.id] === "owner"
              return hasAccess && isOwner && !p.deleted
            })
            break

          case "saved":
            filtered = state.prompts.filter((p) => {
              const hasAccess = state.userPrompts.includes(p.id)
              const role = state.userRoles.prompts[p.id]
              const isSaved = role !== "owner" && role !== undefined
              return hasAccess && isSaved && !p.deleted
            })
            break

          case "favorites":
            filtered = state.prompts.filter((p) => state.favoritePrompts.includes(p.id) && !p.deleted)
            break

          case "collection":
            if (collection) {
              try {
                const promptIds = await CollectionPrompts.getPrompts(collection)
                filtered = state.prompts.filter((prompt) => promptIds.includes(prompt.id) && !prompt.deleted)
              } catch (error) {
                console.error(`Error fetching prompts for collection ${collection}:`, error)
                filtered = []
              }
            } else {
              filtered = []
            }
            break

          case "deleted":
            // Show deleted prompts user has access to
            filtered = state.prompts.filter((p) => p.deleted)
            break

          default:
            filtered = state.prompts.filter((p) => !p.deleted)
            break
        }

        if (tags && tags.length > 0) {
          filtered = filtered.filter((prompt) => tags.some((tag) => prompt.tags?.includes(tag)))
        }

        return filtered
      },

      // General utilities
      formatDate: (dateString: string): string => {
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

      truncateText: (text: string, maxLength: number): string => {
        if (text.length <= maxLength) return text
        return text.substring(0, maxLength) + "..."
      },
    }),
    [
      state.user,
      state.prompts,
      state.collections,
      state.userPrompts,
      state.userCollections,
      state.favoritePrompts,
      state.favoriteCollections,
      state.promptCollectionMap,
      state.userRoles,
    ],
  )

  // Search utility for prompts
  const searchPrompts = useCallback(
    (query: string) => {
      const userId = state.user?.id
      if (!userId) return []

      // Filter prompts user has access to
      const accessiblePrompts = state.prompts

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
    },
    [state.prompts, state.user],
  )

  // Add the editCollection implementation:
  const editCollection = useCallback(
    async (id: string, updates: Partial<CollectionUpdate>) => {
      try {
        await updateCollection(id, updates)
      } catch (error) {
        console.error("Error editing collection:", error)
        throw error
      }
    },
    [updateCollection],
  )

  // Memoize the actions object to prevent infinite re-renders
  const contextActions = useMemo(
    () => ({
      loadPrompts,
      loadCollections,
      loadUser,
      loadTags,
      loadUserRelationships,
      createPrompt,
      updatePrompt,
      deletePrompt,
      restorePrompt,
      toggleFavoritePrompt,
      savePrompt,
      savePromptChanges,
      createCollection,
      updateCollection,
      editCollection,
      deleteCollection,
      toggleFavoriteCollection,
      saveCollection,
      removeFromCollection,
      addPromptToCollection,
      removePromptFromCollection,
      setFilter,
      setSelectedPrompt,
      toggleCollectionsExpanded,
      toggleTagsExpanded,
      setUserRoles,
      setPromptRole,
      setCollectionRole,
      setBatchRoles,
    }),
    [
      loadPrompts,
      loadCollections,
      loadUser,
      loadTags,
      loadUserRelationships,
      createPrompt,
      updatePrompt,
      deletePrompt,
      restorePrompt,
      toggleFavoritePrompt,
      savePrompt,
      savePromptChanges,
      createCollection,
      updateCollection,
      editCollection,
      deleteCollection,
      toggleFavoriteCollection,
      saveCollection,
      removeFromCollection,
      addPromptToCollection,
      removePromptFromCollection,
      setFilter,
      setSelectedPrompt,
      toggleCollectionsExpanded,
      toggleTagsExpanded,
      setUserRoles,
      setPromptRole,
      setCollectionRole,
      setBatchRoles,
    ],
  )

  const contextValue: AppContextType = useMemo(
    () => ({
      state,
      actions: contextActions,
      utils,
      search: { searchPrompts },
    }),
    [state, contextActions, utils, searchPrompts],
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
